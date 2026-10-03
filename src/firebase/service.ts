import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth, isFirebaseConfigured, handleFirestoreError, OperationType } from './config';
import type { Station, PriceReport, Flag, StationWithDetails, FuelType, FlagType, ActiveFlagSummary, StationPrices } from '../types';
import {
  NIGERIA_SEED_STATIONS,
  NIGERIA_SEED_REPORTS,
  NIGERIA_SEED_FLAGS,
} from '../data/nigeriaFuelStations';

const STATIONS_COLLECTION = 'stations';
const PRICE_REPORTS_COLLECTION = 'priceReports';
const FLAGS_COLLECTION = 'flags';

// Local storage backup keys for offline / prototype demo mode
const LOCAL_STATIONS_KEY = 'fsf_stations_ng_v2';
const LOCAL_REPORTS_KEY = 'fsf_price_reports_ng_v2';
const LOCAL_FLAGS_KEY = 'fsf_flags_ng_v2';

// Non-fuel place keywords to actively remove / exclude from any results
const NON_FUEL_EXCLUDE_REGEX = /(church|mosque|chapel|cathedral|parish|ministry|restaurant|cafe|cafeteria|fast food|eatery|grill|bistro|diner|kitchen|bakery|canteen|hotel|lounge|club|bar|school|academy|college|hospital|clinic|pharmacy|supermarket|mall|boutique|salon|spa|estate|parsonage|resort)/i;

// Haversine formula to compute distance in km
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Generate rich realistic seed stations across Nigeria
export function generateSeedData(_centerLat = 6.5244, _centerLng = 3.3792) {
  return {
    seedStations: NIGERIA_SEED_STATIONS,
    seedReports: NIGERIA_SEED_REPORTS,
    seedFlags: NIGERIA_SEED_FLAGS,
  };
}

// Local store helpers
function getLocalStations(): Station[] {
  const raw = localStorage.getItem(LOCAL_STATIONS_KEY);
  if (!raw) {
    localStorage.setItem(LOCAL_STATIONS_KEY, JSON.stringify(NIGERIA_SEED_STATIONS));
    return NIGERIA_SEED_STATIONS;
  }
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length < 50) {
      localStorage.setItem(LOCAL_STATIONS_KEY, JSON.stringify(NIGERIA_SEED_STATIONS));
      return NIGERIA_SEED_STATIONS;
    }
    // Filter out any non-fuel places
    return parsed.filter((st) => !NON_FUEL_EXCLUDE_REGEX.test(st.name));
  } catch {
    return NIGERIA_SEED_STATIONS;
  }
}

function getLocalReports(): PriceReport[] {
  const raw = localStorage.getItem(LOCAL_REPORTS_KEY);
  if (!raw) {
    localStorage.setItem(LOCAL_REPORTS_KEY, JSON.stringify(NIGERIA_SEED_REPORTS));
    return NIGERIA_SEED_REPORTS;
  }
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length < 50) {
      localStorage.setItem(LOCAL_REPORTS_KEY, JSON.stringify(NIGERIA_SEED_REPORTS));
      return NIGERIA_SEED_REPORTS;
    }
    return parsed;
  } catch {
    return NIGERIA_SEED_REPORTS;
  }
}

function getLocalFlags(): Flag[] {
  const raw = localStorage.getItem(LOCAL_FLAGS_KEY);
  if (!raw) {
    localStorage.setItem(LOCAL_FLAGS_KEY, JSON.stringify(NIGERIA_SEED_FLAGS));
    return NIGERIA_SEED_FLAGS;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return NIGERIA_SEED_FLAGS;
  }
}

// Re-anchor seed data if needed
export function reanchorDemoDataToUserLocation(_userLat: number, _userLng: number) {
  // Preserve the verified Nigerian fuel stations dataset
  if (!localStorage.getItem(LOCAL_STATIONS_KEY)) {
    localStorage.setItem(LOCAL_STATIONS_KEY, JSON.stringify(NIGERIA_SEED_STATIONS));
    localStorage.setItem(LOCAL_REPORTS_KEY, JSON.stringify(NIGERIA_SEED_REPORTS));
    localStorage.setItem(LOCAL_FLAGS_KEY, JSON.stringify(NIGERIA_SEED_FLAGS));
  }
}

// Compute active flags from last 6 hours: badge if count >= 2
export function computeActiveFlags(flags: Flag[], stationId: string): ActiveFlagSummary[] {
  const SIX_HOURS_MS = 6 * 60 * 60 * 1000;
  const cutoff = Date.now() - SIX_HOURS_MS;

  const relevant = flags.filter((f) => {
    if (f.stationId !== stationId) return false;
    const time = new Date(f.flaggedAt).getTime();
    return time >= cutoff;
  });

  const countByType: Record<FlagType, { count: number; latest: string }> = {
    no_fuel: { count: 0, latest: '' },
    long_queue: { count: 0, latest: '' },
    closed: { count: 0, latest: '' },
    wrong_price: { count: 0, latest: '' },
  };

  relevant.forEach((f) => {
    if (countByType[f.type]) {
      countByType[f.type].count += 1;
      if (!countByType[f.type].latest || new Date(f.flaggedAt) > new Date(countByType[f.type].latest)) {
        countByType[f.type].latest = f.flaggedAt;
      }
    }
  });

  const summaries: ActiveFlagSummary[] = [];
  (Object.keys(countByType) as FlagType[]).forEach((type) => {
    if (countByType[type].count >= 2) {
      summaries.push({
        type,
        count: countByType[type].count,
        recentTimestamp: countByType[type].latest,
      });
    }
  });

  return summaries;
}

// Compute station's current price per fuel type: most recent priceReports doc (reportedAt desc, limit 1)
export function computeCurrentPrices(reports: PriceReport[], stationId: string): { prices: StationPrices; lastUpdated?: string } {
  const stationReports = reports
    .filter((r) => r.stationId === stationId)
    .sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime());

  const prices: StationPrices = {};
  let lastUpdated: string | undefined = undefined;

  for (const rep of stationReports) {
    if (!lastUpdated || new Date(rep.reportedAt) > new Date(lastUpdated)) {
      lastUpdated = rep.reportedAt;
    }
    if (!prices[rep.fuelType]) {
      prices[rep.fuelType] = {
        price: rep.price,
        reportedAt: rep.reportedAt,
      };
    }
  }

  return { prices, lastUpdated };
}

// Fetch all stations with computed prices and active flags
export async function fetchStationsWithDetails(
  userLat?: number,
  userLng?: number
): Promise<StationWithDetails[]> {
  let rawStations: Station[] = [];
  let rawReports: PriceReport[] = [];
  let rawFlags: Flag[] = [];

  if (isFirebaseConfigured && db) {
    try {
      // 1. Fetch stations from Firestore
      const stationsSnap = await getDocs(collection(db, STATIONS_COLLECTION));
      stationsSnap.forEach((d) => {
        const data = d.data();
        const stationName = data.name || '';
        // Strict guard: filter out any places that are churches, restaurants, or non-fuel
        if (!NON_FUEL_EXCLUDE_REGEX.test(stationName)) {
          rawStations.push({
            id: d.id,
            name: stationName,
            address: data.address || '',
            latitude: Number(data.latitude),
            longitude: Number(data.longitude),
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt || new Date().toISOString(),
          });
        }
      });

      // 2. Fetch reports from Firestore
      const reportsSnap = await getDocs(query(collection(db, PRICE_REPORTS_COLLECTION), orderBy('reportedAt', 'desc')));
      reportsSnap.forEach((d) => {
        const data = d.data();
        rawReports.push({
          id: d.id,
          stationId: data.stationId,
          fuelType: data.fuelType,
          price: Number(data.price),
          reportedBy: data.reportedBy,
          reportedAt: data.reportedAt?.toDate ? data.reportedAt.toDate().toISOString() : data.reportedAt || new Date().toISOString(),
        });
      });

      // 3. Fetch flags from Firestore
      const flagsSnap = await getDocs(query(collection(db, FLAGS_COLLECTION), orderBy('flaggedAt', 'desc')));
      flagsSnap.forEach((d) => {
        const data = d.data();
        rawFlags.push({
          id: d.id,
          stationId: data.stationId,
          type: data.type,
          note: data.note,
          flaggedBy: data.flaggedBy,
          flaggedAt: data.flaggedAt?.toDate ? data.flaggedAt.toDate().toISOString() : data.flaggedAt || new Date().toISOString(),
        });
      });
    } catch (err) {
      console.warn('Firestore fetch failed or empty, using local/demo data:', err);
      rawStations = getLocalStations();
      rawReports = getLocalReports();
      rawFlags = getLocalFlags();
    }
  }

  // Fallback to local verified Nigerian seed stations if Firestore collection is empty
  if (rawStations.length === 0) {
    rawStations = getLocalStations();
    rawReports = getLocalReports();
    rawFlags = getLocalFlags();
  }

  // Double check non-fuel filter
  const cleanStations = rawStations.filter((st) => !NON_FUEL_EXCLUDE_REGEX.test(st.name));

  return cleanStations.map((station) => {
    const { prices, lastUpdated } = computeCurrentPrices(rawReports, station.id);
    const activeFlags = computeActiveFlags(rawFlags, station.id);
    const distanceKm =
      userLat !== undefined && userLng !== undefined
        ? calculateDistanceKm(userLat, userLng, station.latitude, station.longitude)
        : undefined;

    return {
      ...station,
      currentPrices: prices,
      activeFlags,
      distanceKm,
      lastUpdated,
    };
  });
}

// Add a new Price Report
export async function submitPriceReport(
  stationId: string,
  fuelType: FuelType,
  price: number,
  userId: string
): Promise<PriceReport> {
  const effectiveUserId = (auth?.currentUser?.uid || userId || 'community-driver').slice(0, 128);
  const newReport: PriceReport = {
    id: 'pr-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    stationId,
    fuelType,
    price,
    reportedBy: effectiveUserId,
    reportedAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured && db) {
    try {
      const docRef = await addDoc(collection(db, PRICE_REPORTS_COLLECTION), {
        stationId,
        fuelType,
        price,
        reportedBy: effectiveUserId,
        reportedAt: serverTimestamp(),
      });
      newReport.id = docRef.id;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, PRICE_REPORTS_COLLECTION, auth);
    }
  }

  // Sync to local demo store
  const current = getLocalReports();
  current.unshift(newReport);
  localStorage.setItem(LOCAL_REPORTS_KEY, JSON.stringify(current));

  return newReport;
}

// Add a new Station Flag
export async function submitStationFlag(
  stationId: string,
  type: FlagType,
  note: string | undefined,
  userId: string
): Promise<Flag> {
  const effectiveUserId = (auth?.currentUser?.uid || userId || 'community-driver').slice(0, 128);
  const cleanNote = note?.trim() ? note.trim().slice(0, 300) : undefined;
  const newFlag: Flag = {
    id: 'fl-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    stationId,
    type,
    note: cleanNote,
    flaggedBy: effectiveUserId,
    flaggedAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured && db) {
    try {
      const docRef = await addDoc(collection(db, FLAGS_COLLECTION), {
        stationId,
        type,
        ...(cleanNote ? { note: cleanNote } : {}),
        flaggedBy: effectiveUserId,
        flaggedAt: serverTimestamp(),
      });
      newFlag.id = docRef.id;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, FLAGS_COLLECTION, auth);
    }
  }

  // Sync to local demo store
  const current = getLocalFlags();
  current.unshift(newFlag);
  localStorage.setItem(LOCAL_FLAGS_KEY, JSON.stringify(current));

  return newFlag;
}

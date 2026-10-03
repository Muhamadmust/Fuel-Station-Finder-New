export type FuelType = 'petrol' | 'diesel' | 'premium';

export type FlagType = 'no_fuel' | 'long_queue' | 'closed' | 'wrong_price';

export interface Station {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  createdAt: string; // ISO string or timestamp
}

export interface PriceReport {
  id: string;
  stationId: string;
  fuelType: FuelType;
  price: number;
  reportedBy: string;
  reportedAt: string; // ISO string
}

export interface Flag {
  id: string;
  stationId: string;
  type: FlagType;
  note?: string;
  flaggedBy: string;
  flaggedAt: string; // ISO string
}

export interface ActiveFlagSummary {
  type: FlagType;
  count: number;
  recentTimestamp: string;
}

export interface StationPrices {
  petrol?: { price: number; reportedAt: string };
  diesel?: { price: number; reportedAt: string };
  premium?: { price: number; reportedAt: string };
}

export interface StationWithDetails extends Station {
  currentPrices: StationPrices;
  activeFlags: ActiveFlagSummary[];
  distanceKm?: number;
  lastUpdated?: string;
}

export type SortOption = 'nearest' | 'cheapest' | 'recent';

export interface FilterOptions {
  fuelType: FuelType | 'all';
  radiusKm: number;
  sortBy: SortOption;
  searchQuery: string;
}

export interface UserLocation {
  lat: number;
  lng: number;
}

import type { Station, PriceReport, Flag } from '../types';

export interface CityRegion {
  id: string;
  name: string;
  lat: number;
  lng: number;
  zoom: number;
}

export const NIGERIAN_REGIONS: CityRegion[] = [
  { id: 'all', name: 'All Nigeria', lat: 7.5, lng: 5.5, zoom: 6 },
  { id: 'lagos', name: 'Lagos Metro', lat: 6.5244, lng: 3.3792, zoom: 12 },
  { id: 'abuja', name: 'Abuja FCT', lat: 9.0578, lng: 7.4895, zoom: 12 },
  { id: 'ibadan', name: 'Ibadan', lat: 7.4040, lng: 3.9050, zoom: 12 },
  { id: 'ph', name: 'Port Harcourt', lat: 4.8150, lng: 7.0120, zoom: 12 },
];

const now = Date.now();
const pastDays = (d: number) => new Date(now - d * 86400000).toISOString();
const pastMins = (m: number) => new Date(now - m * 60000).toISOString();

export const NIGERIA_SEED_STATIONS: Station[] = [
  // --- LAGOS ISLAND, IKOYI & VICTORIA ISLAND ---
  {
    id: 'ng-lag-01',
    name: 'NNPCL Mega Station Ikoyi',
    address: '1 Alfred Rewane Road, Ikoyi, Lagos',
    latitude: 6.4542,
    longitude: 3.4287,
    createdAt: pastDays(45),
  },
  {
    id: 'ng-lag-02',
    name: 'TotalEnergies Falomo Service Station',
    address: 'Falomo Roundabout, Awolowo Road, Ikoyi, Lagos',
    latitude: 6.4485,
    longitude: 3.4312,
    createdAt: pastDays(40),
  },
  {
    id: 'ng-lag-03',
    name: 'Mobil Service Station Victoria Island',
    address: '14 Adeola Odeku Street, Victoria Island, Lagos',
    latitude: 6.4298,
    longitude: 3.4215,
    createdAt: pastDays(38),
  },
  {
    id: 'ng-lag-04',
    name: 'Conoil Service Station Marina',
    address: '38 Marina Road, Lagos Island, Lagos',
    latitude: 6.4521,
    longitude: 3.3934,
    createdAt: pastDays(35),
  },
  {
    id: 'ng-lag-05',
    name: 'Oando Service Station Victoria Island',
    address: 'Ozumba Mbadiwe Avenue, Victoria Island, Lagos',
    latitude: 6.4356,
    longitude: 3.4290,
    createdAt: pastDays(32),
  },
  {
    id: 'ng-lag-06',
    name: 'MRS Oil Service Station Lekki Phase 1',
    address: 'Admiralty Way, Lekki Phase 1, Lagos',
    latitude: 6.4428,
    longitude: 3.4754,
    createdAt: pastDays(30),
  },
  {
    id: 'ng-lag-07',
    name: 'TotalEnergies Lekki Expressway',
    address: 'Lekki-Epe Expressway, Marwa Bus Stop, Lekki, Lagos',
    latitude: 6.4382,
    longitude: 3.4680,
    createdAt: pastDays(28),
  },
  {
    id: 'ng-lag-08',
    name: 'Pinnacle Oil & Gas Lekki',
    address: '2nd Toll Gate, Lekki-Epe Expressway, Lagos',
    latitude: 6.4310,
    longitude: 3.5350,
    createdAt: pastDays(25),
  },
  {
    id: 'ng-lag-09',
    name: 'Rainoil Service Station Agungi',
    address: 'Lekki-Epe Expressway, Agungi, Lekki, Lagos',
    latitude: 6.4365,
    longitude: 3.5180,
    createdAt: pastDays(22),
  },
  {
    id: 'ng-lag-10',
    name: 'Northwest Petroleum Victoria Island',
    address: 'Ahmadu Bello Way, Victoria Island, Lagos',
    latitude: 6.4320,
    longitude: 3.4380,
    createdAt: pastDays(20),
  },
  {
    id: 'ng-lag-11',
    name: 'NNPCL Retail Outlet Oniru',
    address: 'Prince Alaba Oniru Way, Oniru, Victoria Island, Lagos',
    latitude: 6.4395,
    longitude: 3.4450,
    createdAt: pastDays(18),
  },
  {
    id: 'ng-lag-12',
    name: 'Ardova Plc (AP) Service Station Ikoyi',
    address: 'Kingsway Road (Alfred Rewane), Ikoyi, Lagos',
    latitude: 6.4578,
    longitude: 3.4310,
    createdAt: pastDays(15),
  },

  // --- LAGOS MAINLAND (IKEJA, MARYLAND, YABA, SURULERE, OJOTA) ---
  {
    id: 'ng-lag-13',
    name: 'NNPCL Mega Station Maryland',
    address: 'Ikorodu Road, Maryland, Ikeja, Lagos',
    latitude: 6.5712,
    longitude: 3.3678,
    createdAt: pastDays(50),
  },
  {
    id: 'ng-lag-14',
    name: 'TotalEnergies Maryland',
    address: 'Mobolaji Bank Anthony Way, Maryland, Ikeja, Lagos',
    latitude: 6.5740,
    longitude: 3.3630,
    createdAt: pastDays(42),
  },
  {
    id: 'ng-lag-15',
    name: 'Mobil Service Station Ikeja GRA',
    address: 'Isaac John Street, GRA Ikeja, Lagos',
    latitude: 6.5862,
    longitude: 3.3556,
    createdAt: pastDays(38),
  },
  {
    id: 'ng-lag-16',
    name: 'Conoil Service Station Ikeja',
    address: 'Obafemi Awolowo Way, Ikeja, Lagos',
    latitude: 6.5980,
    longitude: 3.3420,
    createdAt: pastDays(36),
  },
  {
    id: 'ng-lag-17',
    name: 'Bovas & Company Service Station Alausa',
    address: 'CBD Secretariat Road, Alausa, Ikeja, Lagos',
    latitude: 6.6190,
    longitude: 3.3580,
    createdAt: pastDays(34),
  },
  {
    id: 'ng-lag-18',
    name: 'TotalEnergies Ikeja Along',
    address: 'Agege Motor Road, Ikeja Along, Lagos',
    latitude: 6.6025,
    longitude: 3.3360,
    createdAt: pastDays(32),
  },
  {
    id: 'ng-lag-19',
    name: 'NNPCL Retail Anthony Village',
    address: 'Ikorodu Expressway, Anthony Village, Lagos',
    latitude: 6.5595,
    longitude: 3.3710,
    createdAt: pastDays(30),
  },
  {
    id: 'ng-lag-20',
    name: 'Mobil Service Station Yaba',
    address: 'Herbert Macaulay Way, Alagomeji, Yaba, Lagos',
    latitude: 6.4985,
    longitude: 3.3790,
    createdAt: pastDays(28),
  },
  {
    id: 'ng-lag-21',
    name: 'TotalEnergies Sabo Yaba',
    address: 'Commercial Avenue, Sabo, Yaba, Lagos',
    latitude: 6.5080,
    longitude: 3.3760,
    createdAt: pastDays(26),
  },
  {
    id: 'ng-lag-22',
    name: 'Oando Service Station Surulere',
    address: 'Funsho Williams Avenue (Western Ave), Surulere, Lagos',
    latitude: 6.4950,
    longitude: 3.3620,
    createdAt: pastDays(25),
  },
  {
    id: 'ng-lag-23',
    name: 'MRS Oil Service Station Ojuelegba',
    address: 'Western Avenue, Ojuelegba Underbridge, Surulere, Lagos',
    latitude: 6.5120,
    longitude: 3.3610,
    createdAt: pastDays(24),
  },
  {
    id: 'ng-lag-24',
    name: 'Ardova Plc (AP) Ogunlana',
    address: 'Ogunlana Drive, Surulere, Lagos',
    latitude: 6.5020,
    longitude: 3.3510,
    createdAt: pastDays(22),
  },
  {
    id: 'ng-lag-25',
    name: 'Nipco Filling Station Oshodi',
    address: 'Oshodi-Apapa Expressway, Oshodi, Lagos',
    latitude: 6.5510,
    longitude: 3.3470,
    createdAt: pastDays(20),
  },
  {
    id: 'ng-lag-26',
    name: 'Rainoil Service Station Ojota',
    address: 'Ikorodu Road, Ojota Inter-change, Lagos',
    latitude: 6.5850,
    longitude: 3.3820,
    createdAt: pastDays(19),
  },
  {
    id: 'ng-lag-27',
    name: 'Northwest Petroleum Gbagada',
    address: 'Gbagada-Oworonshoki Expressway, Gbagada, Lagos',
    latitude: 6.5560,
    longitude: 3.3880,
    createdAt: pastDays(18),
  },
  {
    id: 'ng-lag-28',
    name: 'Fatgbems Petroleum Ilupeju',
    address: 'Oshodi-Gbagada Expressway, Ilupeju, Lagos',
    latitude: 6.5520,
    longitude: 3.3650,
    createdAt: pastDays(16),
  },
  {
    id: 'ng-lag-29',
    name: 'Matrix Energy Service Station Festac',
    address: '2nd Avenue, Festac Town, Lagos',
    latitude: 6.4670,
    longitude: 3.2840,
    createdAt: pastDays(15),
  },
  {
    id: 'ng-lag-30',
    name: 'Forte Oil (Ardova) Apapa',
    address: 'Creek Road, Apapa Industrial Area, Lagos',
    latitude: 6.4410,
    longitude: 3.3620,
    createdAt: pastDays(14),
  },
  {
    id: 'ng-lag-31',
    name: 'TotalEnergies Apapa Wharf',
    address: 'Wharf Road, Apapa, Lagos',
    latitude: 6.4440,
    longitude: 3.3680,
    createdAt: pastDays(12),
  },
  {
    id: 'ng-lag-32',
    name: 'NNPCL Retail Magodo Phase 2',
    address: 'CMD Road, Magodo GRA Phase 2, Lagos',
    latitude: 6.6210,
    longitude: 3.3810,
    createdAt: pastDays(10),
  },
  {
    id: 'ng-lag-33',
    name: 'Petrocam Service Station Ketu',
    address: 'Ikorodu Road, Ketu Bus Stop, Lagos',
    latitude: 6.6010,
    longitude: 3.3890,
    createdAt: pastDays(9),
  },
  {
    id: 'ng-lag-34',
    name: 'Bovas Fuel Station Ikorodu',
    address: 'Ikorodu-Sagamu Road, Ikorodu Central, Lagos',
    latitude: 6.6280,
    longitude: 3.5120,
    createdAt: pastDays(8),
  },
  {
    id: 'ng-lag-35',
    name: 'Ascon Oil Service Station Lekki',
    address: 'Lekki-Epe Expressway, Chevron Roundabout, Lekki, Lagos',
    latitude: 6.4350,
    longitude: 3.5380,
    createdAt: pastDays(7),
  },
  {
    id: 'ng-lag-36',
    name: 'Hyde Energy Service Station Sangotedo',
    address: 'Sangotedo, Lekki-Epe Expressway, Lagos',
    latitude: 6.4710,
    longitude: 3.6120,
    createdAt: pastDays(6),
  },

  // --- ABUJA FEDERAL CAPITAL TERRITORY (FCT) ---
  {
    id: 'ng-abj-37',
    name: 'NNPCL Mega Station Abuja CBD',
    address: 'Olusegun Obasanjo Way, Central Business District, Abuja',
    latitude: 9.0578,
    longitude: 7.4895,
    createdAt: pastDays(45),
  },
  {
    id: 'ng-abj-38',
    name: 'TotalEnergies Wuse 2 Station',
    address: 'Aminu Kano Crescent, Wuse 2, Abuja',
    latitude: 9.0795,
    longitude: 7.4720,
    createdAt: pastDays(40),
  },
  {
    id: 'ng-abj-39',
    name: 'Mobil Service Station Central Area',
    address: 'Herbert Macaulay Way, Central Business District, Abuja',
    latitude: 9.0520,
    longitude: 7.4930,
    createdAt: pastDays(38),
  },
  {
    id: 'ng-abj-40',
    name: 'Conoil Mega Station Area 11 Garki',
    address: 'Ahmadu Bello Way, Area 11, Garki, Abuja',
    latitude: 9.0340,
    longitude: 7.4880,
    createdAt: pastDays(35),
  },
  {
    id: 'ng-abj-41',
    name: 'Oando Service Station Maitama',
    address: 'Shehu Shagari Way, Maitama District, Abuja',
    latitude: 9.0880,
    longitude: 7.4980,
    createdAt: pastDays(30),
  },
  {
    id: 'ng-abj-42',
    name: 'AA Rano Mega Station Jabi',
    address: 'Obafemi Awolowo Way, Jabi District, Abuja',
    latitude: 9.0710,
    longitude: 7.4250,
    createdAt: pastDays(28),
  },
  {
    id: 'ng-abj-43',
    name: 'AYM Shafa Fuel Station Utako',
    address: 'Shehu YarAdua Way, Utako District, Abuja',
    latitude: 9.0620,
    longitude: 7.4410,
    createdAt: pastDays(25),
  },
  {
    id: 'ng-abj-44',
    name: 'NNPCL Retail Airport Road Lugbe',
    address: 'Umaru Musa YarAdua Expressway, Lugbe, Abuja',
    latitude: 8.9860,
    longitude: 7.3780,
    createdAt: pastDays(22),
  },
  {
    id: 'ng-abj-45',
    name: 'Northwest Petroleum Gwarinpa',
    address: '1st Avenue, Gwarinpa Estate, Abuja',
    latitude: 9.1080,
    longitude: 7.4110,
    createdAt: pastDays(20),
  },
  {
    id: 'ng-abj-46',
    name: 'Rainoil Service Station Apo',
    address: 'Apo Mechanic Village Expressway, Apo, Abuja',
    latitude: 9.0080,
    longitude: 7.5020,
    createdAt: pastDays(18),
  },
  {
    id: 'ng-abj-47',
    name: 'MRS Oil Service Station Wuse Zone 5',
    address: 'Dalaba Street, Wuse Zone 5, Abuja',
    latitude: 9.0640,
    longitude: 7.4660,
    createdAt: pastDays(15),
  },
  {
    id: 'ng-abj-48',
    name: 'TotalEnergies Kubwa Expressway',
    address: 'Kubwa-Zuba Expressway, Gwarinpa, Abuja',
    latitude: 9.1220,
    longitude: 7.3790,
    createdAt: pastDays(12),
  },

  // --- PORT HARCOURT, RIVERS STATE ---
  {
    id: 'ng-ph-49',
    name: 'NNPCL Mega Station Port Harcourt',
    address: 'Port Harcourt-Aba Expressway, Rumuokwuta, Port Harcourt',
    latitude: 4.8240,
    longitude: 7.0090,
    createdAt: pastDays(35),
  },
  {
    id: 'ng-ph-50',
    name: 'TotalEnergies Trans-Amadi',
    address: 'Trans-Amadi Industrial Layout, Port Harcourt',
    latitude: 4.8120,
    longitude: 7.0340,
    createdAt: pastDays(30),
  },
  {
    id: 'ng-ph-51',
    name: 'Mobil Service Station GRA Phase 2',
    address: 'Olu Obasanjo Road, GRA Phase 2, Port Harcourt',
    latitude: 4.8210,
    longitude: 6.9980,
    createdAt: pastDays(25),
  },

  // --- IBADAN, OYO STATE ---
  {
    id: 'ng-ib-52',
    name: 'Bovas Petroleum Bodija',
    address: 'Secretariat-Bodija Road, Bodija, Ibadan',
    latitude: 7.4320,
    longitude: 3.9050,
    createdAt: pastDays(35),
  },
  {
    id: 'ng-ib-53',
    name: 'NNPCL Mega Station Iwo Road',
    address: 'Iwo Road Interchange, Ibadan, Oyo',
    latitude: 7.4040,
    longitude: 3.9480,
    createdAt: pastDays(32),
  },
  {
    id: 'ng-ib-54',
    name: 'TotalEnergies Ring Road Ibadan',
    address: 'Ring Road, Challenge Area, Ibadan',
    latitude: 7.3610,
    longitude: 3.8720,
    createdAt: pastDays(28),
  },
  {
    id: 'ng-ib-55',
    name: 'Conoil Service Station Dugbe',
    address: 'Dugbe Commercial District, Ibadan',
    latitude: 7.3880,
    longitude: 3.8860,
    createdAt: pastDays(25),
  },
  {
    id: 'ng-ib-56',
    name: 'Bovas Fuel Station Iwo Road',
    address: 'Old Ife Road, Iwo Road, Ibadan',
    latitude: 7.4100,
    longitude: 3.9390,
    createdAt: pastDays(22),
  },
];

// Realistic researched prices in Nigerian Naira (PMS Petrol, Diesel AGO, Premium)
export const NIGERIA_SEED_REPORTS: PriceReport[] = [
  // --- LAGOS REPORTS ---
  // NNPCL Ikoyi (NNPCL benchmark retail)
  { id: 'pr-ng-01', stationId: 'ng-lag-01', fuelType: 'petrol', price: 980, reportedBy: 'driver-lagos-01', reportedAt: pastMins(12) },
  { id: 'pr-ng-02', stationId: 'ng-lag-01', fuelType: 'diesel', price: 1390, reportedBy: 'driver-lagos-01', reportedAt: pastMins(15) },
  { id: 'pr-ng-03', stationId: 'ng-lag-01', fuelType: 'premium', price: 1250, reportedBy: 'driver-lagos-01', reportedAt: pastMins(20) },

  // TotalEnergies Falomo
  { id: 'pr-ng-04', stationId: 'ng-lag-02', fuelType: 'petrol', price: 1060, reportedBy: 'driver-lagos-02', reportedAt: pastMins(25) },
  { id: 'pr-ng-05', stationId: 'ng-lag-02', fuelType: 'diesel', price: 1440, reportedBy: 'driver-lagos-02', reportedAt: pastMins(30) },
  { id: 'pr-ng-06', stationId: 'ng-lag-02', fuelType: 'premium', price: 1280, reportedBy: 'driver-lagos-02', reportedAt: pastMins(30) },

  // Mobil VI
  { id: 'pr-ng-07', stationId: 'ng-lag-03', fuelType: 'petrol', price: 1065, reportedBy: 'driver-lagos-03', reportedAt: pastMins(40) },
  { id: 'pr-ng-08', stationId: 'ng-lag-03', fuelType: 'diesel', price: 1450, reportedBy: 'driver-lagos-03', reportedAt: pastMins(45) },
  { id: 'pr-ng-09', stationId: 'ng-lag-03', fuelType: 'premium', price: 1290, reportedBy: 'driver-lagos-03', reportedAt: pastMins(50) },

  // Conoil Marina
  { id: 'pr-ng-10', stationId: 'ng-lag-04', fuelType: 'petrol', price: 1050, reportedBy: 'driver-lagos-04', reportedAt: pastMins(55) },
  { id: 'pr-ng-11', stationId: 'ng-lag-04', fuelType: 'diesel', price: 1430, reportedBy: 'driver-lagos-04', reportedAt: pastMins(60) },

  // Oando VI
  { id: 'pr-ng-12', stationId: 'ng-lag-05', fuelType: 'petrol', price: 1060, reportedBy: 'driver-lagos-05', reportedAt: pastMins(35) },
  { id: 'pr-ng-13', stationId: 'ng-lag-05', fuelType: 'diesel', price: 1445, reportedBy: 'driver-lagos-05', reportedAt: pastMins(40) },

  // MRS Lekki Phase 1
  { id: 'pr-ng-14', stationId: 'ng-lag-06', fuelType: 'petrol', price: 1070, reportedBy: 'driver-lagos-06', reportedAt: pastMins(70) },
  { id: 'pr-ng-15', stationId: 'ng-lag-06', fuelType: 'diesel', price: 1460, reportedBy: 'driver-lagos-06', reportedAt: pastMins(75) },

  // TotalEnergies Lekki
  { id: 'pr-ng-16', stationId: 'ng-lag-07', fuelType: 'petrol', price: 1060, reportedBy: 'driver-lagos-07', reportedAt: pastMins(18) },
  { id: 'pr-ng-17', stationId: 'ng-lag-07', fuelType: 'diesel', price: 1440, reportedBy: 'driver-lagos-07', reportedAt: pastMins(22) },

  // Pinnacle Lekki (Cheaper independent)
  { id: 'pr-ng-18', stationId: 'ng-lag-08', fuelType: 'petrol', price: 1040, reportedBy: 'driver-lagos-08', reportedAt: pastMins(45) },
  { id: 'pr-ng-19', stationId: 'ng-lag-08', fuelType: 'diesel', price: 1420, reportedBy: 'driver-lagos-08', reportedAt: pastMins(50) },

  // Rainoil Agungi
  { id: 'pr-ng-20', stationId: 'ng-lag-09', fuelType: 'petrol', price: 1050, reportedBy: 'driver-lagos-09', reportedAt: pastMins(65) },
  { id: 'pr-ng-21', stationId: 'ng-lag-09', fuelType: 'diesel', price: 1430, reportedBy: 'driver-lagos-09', reportedAt: pastMins(70) },

  // Northwest VI
  { id: 'pr-ng-22', stationId: 'ng-lag-10', fuelType: 'petrol', price: 1035, reportedBy: 'driver-lagos-10', reportedAt: pastMins(80) },
  { id: 'pr-ng-23', stationId: 'ng-lag-10', fuelType: 'diesel', price: 1420, reportedBy: 'driver-lagos-10', reportedAt: pastMins(85) },

  // NNPCL Oniru
  { id: 'pr-ng-24', stationId: 'ng-lag-11', fuelType: 'petrol', price: 985, reportedBy: 'driver-lagos-11', reportedAt: pastMins(10) },
  { id: 'pr-ng-25', stationId: 'ng-lag-11', fuelType: 'diesel', price: 1390, reportedBy: 'driver-lagos-11', reportedAt: pastMins(15) },

  // Ardova AP Ikoyi
  { id: 'pr-ng-26', stationId: 'ng-lag-12', fuelType: 'petrol', price: 1060, reportedBy: 'driver-lagos-12', reportedAt: pastMins(90) },
  { id: 'pr-ng-27', stationId: 'ng-lag-12', fuelType: 'diesel', price: 1440, reportedBy: 'driver-lagos-12', reportedAt: pastMins(95) },

  // NNPCL Maryland (High traffic Mega Station)
  { id: 'pr-ng-28', stationId: 'ng-lag-13', fuelType: 'petrol', price: 980, reportedBy: 'driver-mainland-01', reportedAt: pastMins(8) },
  { id: 'pr-ng-29', stationId: 'ng-lag-13', fuelType: 'diesel', price: 1390, reportedBy: 'driver-mainland-01', reportedAt: pastMins(12) },
  { id: 'pr-ng-30', stationId: 'ng-lag-13', fuelType: 'premium', price: 1250, reportedBy: 'driver-mainland-01', reportedAt: pastMins(15) },

  // TotalEnergies Maryland
  { id: 'pr-ng-31', stationId: 'ng-lag-14', fuelType: 'petrol', price: 1060, reportedBy: 'driver-mainland-02', reportedAt: pastMins(30) },
  { id: 'pr-ng-32', stationId: 'ng-lag-14', fuelType: 'diesel', price: 1440, reportedBy: 'driver-mainland-02', reportedAt: pastMins(35) },

  // Mobil Ikeja GRA
  { id: 'pr-ng-33', stationId: 'ng-lag-15', fuelType: 'petrol', price: 1065, reportedBy: 'driver-mainland-03', reportedAt: pastMins(42) },
  { id: 'pr-ng-34', stationId: 'ng-lag-15', fuelType: 'diesel', price: 1450, reportedBy: 'driver-mainland-03', reportedAt: pastMins(45) },

  // Conoil Ikeja
  { id: 'pr-ng-35', stationId: 'ng-lag-16', fuelType: 'petrol', price: 1050, reportedBy: 'driver-mainland-04', reportedAt: pastMins(55) },
  { id: 'pr-ng-36', stationId: 'ng-lag-16', fuelType: 'diesel', price: 1430, reportedBy: 'driver-mainland-04', reportedAt: pastMins(60) },

  // Bovas Alausa (Famous for fairest pricing)
  { id: 'pr-ng-37', stationId: 'ng-lag-17', fuelType: 'petrol', price: 970, reportedBy: 'driver-mainland-05', reportedAt: pastMins(5) },
  { id: 'pr-ng-38', stationId: 'ng-lag-17', fuelType: 'diesel', price: 1380, reportedBy: 'driver-mainland-05', reportedAt: pastMins(8) },
  { id: 'pr-ng-39', stationId: 'ng-lag-17', fuelType: 'premium', price: 1240, reportedBy: 'driver-mainland-05', reportedAt: pastMins(10) },

  // TotalEnergies Ikeja Along
  { id: 'pr-ng-40', stationId: 'ng-lag-18', fuelType: 'petrol', price: 1060, reportedBy: 'driver-mainland-06', reportedAt: pastMins(65) },
  { id: 'pr-ng-41', stationId: 'ng-lag-18', fuelType: 'diesel', price: 1440, reportedBy: 'driver-mainland-06', reportedAt: pastMins(70) },

  // NNPCL Anthony
  { id: 'pr-ng-42', stationId: 'ng-lag-19', fuelType: 'petrol', price: 985, reportedBy: 'driver-mainland-07', reportedAt: pastMins(14) },
  { id: 'pr-ng-43', stationId: 'ng-lag-19', fuelType: 'diesel', price: 1390, reportedBy: 'driver-mainland-07', reportedAt: pastMins(18) },

  // Mobil Yaba
  { id: 'pr-ng-44', stationId: 'ng-lag-20', fuelType: 'petrol', price: 1065, reportedBy: 'driver-mainland-08', reportedAt: pastMins(50) },
  { id: 'pr-ng-45', stationId: 'ng-lag-20', fuelType: 'diesel', price: 1450, reportedBy: 'driver-mainland-08', reportedAt: pastMins(55) },

  // TotalEnergies Sabo Yaba
  { id: 'pr-ng-46', stationId: 'ng-lag-21', fuelType: 'petrol', price: 1060, reportedBy: 'driver-mainland-09', reportedAt: pastMins(38) },
  { id: 'pr-ng-47', stationId: 'ng-lag-21', fuelType: 'diesel', price: 1440, reportedBy: 'driver-mainland-09', reportedAt: pastMins(42) },

  // Oando Surulere
  { id: 'pr-ng-48', stationId: 'ng-lag-22', fuelType: 'petrol', price: 1060, reportedBy: 'driver-mainland-10', reportedAt: pastMins(48) },
  { id: 'pr-ng-49', stationId: 'ng-lag-22', fuelType: 'diesel', price: 1445, reportedBy: 'driver-mainland-10', reportedAt: pastMins(52) },

  // MRS Ojuelegba
  { id: 'pr-ng-50', stationId: 'ng-lag-23', fuelType: 'petrol', price: 1065, reportedBy: 'driver-mainland-11', reportedAt: pastMins(80) },
  { id: 'pr-ng-51', stationId: 'ng-lag-23', fuelType: 'diesel', price: 1450, reportedBy: 'driver-mainland-11', reportedAt: pastMins(85) },

  // Ardova AP Surulere
  { id: 'pr-ng-52', stationId: 'ng-lag-24', fuelType: 'petrol', price: 1060, reportedBy: 'driver-mainland-12', reportedAt: pastMins(60) },
  { id: 'pr-ng-53', stationId: 'ng-lag-24', fuelType: 'diesel', price: 1440, reportedBy: 'driver-mainland-12', reportedAt: pastMins(65) },

  // Nipco Oshodi
  { id: 'pr-ng-54', stationId: 'ng-lag-25', fuelType: 'petrol', price: 1045, reportedBy: 'driver-mainland-13', reportedAt: pastMins(40) },
  { id: 'pr-ng-55', stationId: 'ng-lag-25', fuelType: 'diesel', price: 1425, reportedBy: 'driver-mainland-13', reportedAt: pastMins(45) },

  // Rainoil Ojota
  { id: 'pr-ng-56', stationId: 'ng-lag-26', fuelType: 'petrol', price: 1050, reportedBy: 'driver-mainland-14', reportedAt: pastMins(52) },
  { id: 'pr-ng-57', stationId: 'ng-lag-26', fuelType: 'diesel', price: 1430, reportedBy: 'driver-mainland-14', reportedAt: pastMins(58) },

  // Northwest Gbagada
  { id: 'pr-ng-58', stationId: 'ng-lag-27', fuelType: 'petrol', price: 1035, reportedBy: 'driver-mainland-15', reportedAt: pastMins(24) },
  { id: 'pr-ng-59', stationId: 'ng-lag-27', fuelType: 'diesel', price: 1420, reportedBy: 'driver-mainland-15', reportedAt: pastMins(28) },

  // Fatgbems Ilupeju
  { id: 'pr-ng-60', stationId: 'ng-lag-28', fuelType: 'petrol', price: 1040, reportedBy: 'driver-mainland-16', reportedAt: pastMins(72) },
  { id: 'pr-ng-61', stationId: 'ng-lag-28', fuelType: 'diesel', price: 1425, reportedBy: 'driver-mainland-16', reportedAt: pastMins(76) },

  // Matrix Festac
  { id: 'pr-ng-62', stationId: 'ng-lag-29', fuelType: 'petrol', price: 1045, reportedBy: 'driver-mainland-17', reportedAt: pastMins(90) },
  { id: 'pr-ng-63', stationId: 'ng-lag-29', fuelType: 'diesel', price: 1430, reportedBy: 'driver-mainland-17', reportedAt: pastMins(95) },

  // Forte Oil Apapa
  { id: 'pr-ng-64', stationId: 'ng-lag-30', fuelType: 'petrol', price: 1060, reportedBy: 'driver-mainland-18', reportedAt: pastMins(110) },
  { id: 'pr-ng-65', stationId: 'ng-lag-30', fuelType: 'diesel', price: 1440, reportedBy: 'driver-mainland-18', reportedAt: pastMins(115) },

  // TotalEnergies Apapa Wharf
  { id: 'pr-ng-66', stationId: 'ng-lag-31', fuelType: 'petrol', price: 1060, reportedBy: 'driver-mainland-19', reportedAt: pastMins(105) },
  { id: 'pr-ng-67', stationId: 'ng-lag-31', fuelType: 'diesel', price: 1440, reportedBy: 'driver-mainland-19', reportedAt: pastMins(110) },

  // NNPCL Magodo
  { id: 'pr-ng-68', stationId: 'ng-lag-32', fuelType: 'petrol', price: 985, reportedBy: 'driver-mainland-20', reportedAt: pastMins(15) },
  { id: 'pr-ng-69', stationId: 'ng-lag-32', fuelType: 'diesel', price: 1390, reportedBy: 'driver-mainland-20', reportedAt: pastMins(20) },

  // Petrocam Ketu
  { id: 'pr-ng-70', stationId: 'ng-lag-33', fuelType: 'petrol', price: 1055, reportedBy: 'driver-mainland-21', reportedAt: pastMins(48) },
  { id: 'pr-ng-71', stationId: 'ng-lag-33', fuelType: 'diesel', price: 1435, reportedBy: 'driver-mainland-21', reportedAt: pastMins(52) },

  // Bovas Ikorodu
  { id: 'pr-ng-72', stationId: 'ng-lag-34', fuelType: 'petrol', price: 970, reportedBy: 'driver-mainland-22', reportedAt: pastMins(18) },
  { id: 'pr-ng-73', stationId: 'ng-lag-34', fuelType: 'diesel', price: 1380, reportedBy: 'driver-mainland-22', reportedAt: pastMins(22) },

  // Ascon Lekki
  { id: 'pr-ng-74', stationId: 'ng-lag-35', fuelType: 'petrol', price: 1060, reportedBy: 'driver-mainland-23', reportedAt: pastMins(60) },
  { id: 'pr-ng-75', stationId: 'ng-lag-35', fuelType: 'diesel', price: 1445, reportedBy: 'driver-mainland-23', reportedAt: pastMins(65) },

  // Hyde Energy Sangotedo
  { id: 'pr-ng-76', stationId: 'ng-lag-36', fuelType: 'petrol', price: 1050, reportedBy: 'driver-mainland-24', reportedAt: pastMins(85) },
  { id: 'pr-ng-77', stationId: 'ng-lag-36', fuelType: 'diesel', price: 1435, reportedBy: 'driver-mainland-24', reportedAt: pastMins(90) },

  // --- ABUJA REPORTS ---
  // NNPCL Mega Station Abuja CBD
  { id: 'pr-ng-78', stationId: 'ng-abj-37', fuelType: 'petrol', price: 1040, reportedBy: 'driver-abuja-01', reportedAt: pastMins(10) },
  { id: 'pr-ng-79', stationId: 'ng-abj-37', fuelType: 'diesel', price: 1420, reportedBy: 'driver-abuja-01', reportedAt: pastMins(15) },
  { id: 'pr-ng-80', stationId: 'ng-abj-37', fuelType: 'premium', price: 1270, reportedBy: 'driver-abuja-01', reportedAt: pastMins(20) },

  // TotalEnergies Wuse 2
  { id: 'pr-ng-81', stationId: 'ng-abj-38', fuelType: 'petrol', price: 1080, reportedBy: 'driver-abuja-02', reportedAt: pastMins(30) },
  { id: 'pr-ng-82', stationId: 'ng-abj-38', fuelType: 'diesel', price: 1460, reportedBy: 'driver-abuja-02', reportedAt: pastMins(35) },
  { id: 'pr-ng-83', stationId: 'ng-abj-38', fuelType: 'premium', price: 1300, reportedBy: 'driver-abuja-02', reportedAt: pastMins(35) },

  // Mobil Central Area
  { id: 'pr-ng-84', stationId: 'ng-abj-39', fuelType: 'petrol', price: 1085, reportedBy: 'driver-abuja-03', reportedAt: pastMins(40) },
  { id: 'pr-ng-85', stationId: 'ng-abj-39', fuelType: 'diesel', price: 1465, reportedBy: 'driver-abuja-03', reportedAt: pastMins(45) },

  // Conoil Area 11 Garki
  { id: 'pr-ng-86', stationId: 'ng-abj-40', fuelType: 'petrol', price: 1070, reportedBy: 'driver-abuja-04', reportedAt: pastMins(50) },
  { id: 'pr-ng-87', stationId: 'ng-abj-40', fuelType: 'diesel', price: 1450, reportedBy: 'driver-abuja-04', reportedAt: pastMins(55) },

  // Oando Maitama
  { id: 'pr-ng-88', stationId: 'ng-abj-41', fuelType: 'petrol', price: 1080, reportedBy: 'driver-abuja-05', reportedAt: pastMins(25) },
  { id: 'pr-ng-89', stationId: 'ng-abj-41', fuelType: 'diesel', price: 1460, reportedBy: 'driver-abuja-05', reportedAt: pastMins(30) },

  // AA Rano Jabi
  { id: 'pr-ng-90', stationId: 'ng-abj-42', fuelType: 'petrol', price: 1050, reportedBy: 'driver-abuja-06', reportedAt: pastMins(35) },
  { id: 'pr-ng-91', stationId: 'ng-abj-42', fuelType: 'diesel', price: 1430, reportedBy: 'driver-abuja-06', reportedAt: pastMins(40) },

  // AYM Shafa Utako
  { id: 'pr-ng-92', stationId: 'ng-abj-43', fuelType: 'petrol', price: 1045, reportedBy: 'driver-abuja-07', reportedAt: pastMins(42) },
  { id: 'pr-ng-93', stationId: 'ng-abj-43', fuelType: 'diesel', price: 1425, reportedBy: 'driver-abuja-07', reportedAt: pastMins(48) },

  // NNPCL Airport Road Lugbe
  { id: 'pr-ng-94', stationId: 'ng-abj-44', fuelType: 'petrol', price: 1040, reportedBy: 'driver-abuja-08', reportedAt: pastMins(12) },
  { id: 'pr-ng-95', stationId: 'ng-abj-44', fuelType: 'diesel', price: 1420, reportedBy: 'driver-abuja-08', reportedAt: pastMins(16) },

  // Northwest Gwarinpa
  { id: 'pr-ng-96', stationId: 'ng-abj-45', fuelType: 'petrol', price: 1050, reportedBy: 'driver-abuja-09', reportedAt: pastMins(55) },
  { id: 'pr-ng-97', stationId: 'ng-abj-45', fuelType: 'diesel', price: 1430, reportedBy: 'driver-abuja-09', reportedAt: pastMins(60) },

  // Rainoil Apo
  { id: 'pr-ng-98', stationId: 'ng-abj-46', fuelType: 'petrol', price: 1060, reportedBy: 'driver-abuja-10', reportedAt: pastMins(65) },
  { id: 'pr-ng-99', stationId: 'ng-abj-46', fuelType: 'diesel', price: 1440, reportedBy: 'driver-abuja-10', reportedAt: pastMins(70) },

  // MRS Wuse Zone 5
  { id: 'pr-ng-100', stationId: 'ng-abj-47', fuelType: 'petrol', price: 1075, reportedBy: 'driver-abuja-11', reportedAt: pastMins(75) },
  { id: 'pr-ng-101', stationId: 'ng-abj-47', fuelType: 'diesel', price: 1455, reportedBy: 'driver-abuja-11', reportedAt: pastMins(80) },

  // TotalEnergies Kubwa
  { id: 'pr-ng-102', stationId: 'ng-abj-48', fuelType: 'petrol', price: 1080, reportedBy: 'driver-abuja-12', reportedAt: pastMins(85) },
  { id: 'pr-ng-103', stationId: 'ng-abj-48', fuelType: 'diesel', price: 1460, reportedBy: 'driver-abuja-12', reportedAt: pastMins(90) },

  // --- PORT HARCOURT REPORTS ---
  { id: 'pr-ng-104', stationId: 'ng-ph-49', fuelType: 'petrol', price: 1030, reportedBy: 'driver-ph-01', reportedAt: pastMins(20) },
  { id: 'pr-ng-105', stationId: 'ng-ph-49', fuelType: 'diesel', price: 1410, reportedBy: 'driver-ph-01', reportedAt: pastMins(25) },
  { id: 'pr-ng-106', stationId: 'ng-ph-50', fuelType: 'petrol', price: 1070, reportedBy: 'driver-ph-02', reportedAt: pastMins(45) },
  { id: 'pr-ng-107', stationId: 'ng-ph-50', fuelType: 'diesel', price: 1450, reportedBy: 'driver-ph-02', reportedAt: pastMins(50) },
  { id: 'pr-ng-108', stationId: 'ng-ph-51', fuelType: 'petrol', price: 1075, reportedBy: 'driver-ph-03', reportedAt: pastMins(60) },
  { id: 'pr-ng-109', stationId: 'ng-ph-51', fuelType: 'diesel', price: 1455, reportedBy: 'driver-ph-03', reportedAt: pastMins(65) },

  // --- IBADAN REPORTS ---
  { id: 'pr-ng-110', stationId: 'ng-ib-52', fuelType: 'petrol', price: 970, reportedBy: 'driver-ib-01', reportedAt: pastMins(15) },
  { id: 'pr-ng-111', stationId: 'ng-ib-52', fuelType: 'diesel', price: 1380, reportedBy: 'driver-ib-01', reportedAt: pastMins(20) },
  { id: 'pr-ng-112', stationId: 'ng-ib-53', fuelType: 'petrol', price: 985, reportedBy: 'driver-ib-02', reportedAt: pastMins(25) },
  { id: 'pr-ng-113', stationId: 'ng-ib-53', fuelType: 'diesel', price: 1390, reportedBy: 'driver-ib-02', reportedAt: pastMins(30) },
  { id: 'pr-ng-114', stationId: 'ng-ib-54', fuelType: 'petrol', price: 1060, reportedBy: 'driver-ib-03', reportedAt: pastMins(40) },
  { id: 'pr-ng-115', stationId: 'ng-ib-54', fuelType: 'diesel', price: 1440, reportedBy: 'driver-ib-03', reportedAt: pastMins(45) },
  { id: 'pr-ng-116', stationId: 'ng-ib-55', fuelType: 'petrol', price: 1050, reportedBy: 'driver-ib-04', reportedAt: pastMins(50) },
  { id: 'pr-ng-117', stationId: 'ng-ib-55', fuelType: 'diesel', price: 1430, reportedBy: 'driver-ib-04', reportedAt: pastMins(55) },
  { id: 'pr-ng-118', stationId: 'ng-ib-56', fuelType: 'petrol', price: 970, reportedBy: 'driver-ib-05', reportedAt: pastMins(30) },
  { id: 'pr-ng-119', stationId: 'ng-ib-56', fuelType: 'diesel', price: 1380, reportedBy: 'driver-ib-05', reportedAt: pastMins(35) },
];

export const NIGERIA_SEED_FLAGS: Flag[] = [
  // NNPCL Maryland has long queue (very popular due to ₦980 pump price)
  {
    id: 'fl-ng-01',
    stationId: 'ng-lag-13',
    type: 'long_queue',
    note: 'Queue stretches past bus stop on Ikorodu road, approx 20 min wait',
    flaggedBy: 'driver-lag-01',
    flaggedAt: pastMins(30),
  },
  {
    id: 'fl-ng-02',
    stationId: 'ng-lag-13',
    type: 'long_queue',
    note: 'Heavy queue, 4 pumps dispensing actively',
    flaggedBy: 'driver-lag-02',
    flaggedAt: pastMins(15),
  },
  // Bovas Alausa has long queue (cheapest price in Alausa at ₦970)
  {
    id: 'fl-ng-03',
    stationId: 'ng-lag-17',
    type: 'long_queue',
    note: 'Orderly queue moving fast, all 6 pumps running',
    flaggedBy: 'driver-lag-03',
    flaggedAt: pastMins(25),
  },
  {
    id: 'fl-ng-04',
    stationId: 'ng-lag-17',
    type: 'long_queue',
    note: '15 min wait for PMS petrol',
    flaggedBy: 'driver-lag-04',
    flaggedAt: pastMins(10),
  },
  // NNPCL CBD Abuja has queue
  {
    id: 'fl-ng-05',
    stationId: 'ng-abj-37',
    type: 'long_queue',
    note: 'Queue on Obasanjo way, tankers currently discharging diesel',
    flaggedBy: 'driver-abj-01',
    flaggedAt: pastMins(40),
  },
  {
    id: 'fl-ng-06',
    stationId: 'ng-abj-37',
    type: 'long_queue',
    note: 'Multiple lines moving steadily',
    flaggedBy: 'driver-abj-02',
    flaggedAt: pastMins(20),
  },
];

import { Location, LocationType } from '@/types';

// Vaniyambadi coordinates as reference point
export const VANIYAMBADI_CENTER = {
  lat: 12.6819,
  lng: 78.6208,
};

// Location type icons
export const LOCATION_ICONS: Record<LocationType, string> = {
  busstand: '🚌',
  railway: '🚂',
  hospital: '🏥',
  mahal: '🎊',
  school: '🏫',
  college: '🎓',
  temple: '🛕',
  mosque: '🕌',
  market: '🛒',
  petrol: '⛽',
  bank: '🏦',
  village: '🏡',
  town: '🏘️',
  city: '🌆',
  landmark: '📍',
};

export const LOCATIONS: Omit<Location, 'id'>[] = [
  // === VANIYAMBADI TALUK ===

  // Bus Stands
  { name: 'Vaniyambadi Bus Stand', type: 'busstand', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.6825, lng: 78.6200, isActive: true },
  { name: 'Vaniyambadi New Bus Stand', type: 'busstand', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.6830, lng: 78.6215, isActive: true },
  { name: 'Alangayam Bus Stand', type: 'busstand', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.6234, lng: 78.7512, isActive: true },
  { name: 'Jolarpet Bus Stand', type: 'busstand', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.5620, lng: 78.5730, isActive: true },

  // Railway Stations
  { name: 'Vaniyambadi Railway Station', type: 'railway', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.6810, lng: 78.6195, isActive: true },
  { name: 'Jolarpet Junction Railway Station', type: 'railway', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.5615, lng: 78.5725, isActive: true },
  { name: 'Alangayam Railway Station', type: 'railway', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.6230, lng: 78.7508, isActive: true },

  // Hospitals
  { name: 'Government Hospital Vaniyambadi', type: 'hospital', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.6835, lng: 78.6220, isActive: true },
  { name: 'Jameela Hospital Vaniyambadi', type: 'hospital', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.6828, lng: 78.6185, isActive: true },
  { name: 'Shanmuga Hospital', type: 'hospital', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.6815, lng: 78.6230, isActive: true },
  { name: 'Karthik Hospital Vaniyambadi', type: 'hospital', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.6842, lng: 78.6198, isActive: true },
  { name: 'Al-Ameen Hospital', type: 'hospital', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.6805, lng: 78.6212, isActive: true },
  { name: 'PHC Alangayam', type: 'hospital', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.6238, lng: 78.7520, isActive: true },
  { name: 'Yelagiri Government Hospital', type: 'hospital', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.5795, lng: 78.6380, isActive: true },

  // Mahals / Function Halls
  { name: 'SSM Mahal Vaniyambadi', type: 'mahal', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.6850, lng: 78.6180, isActive: true },
  { name: 'KVR Mahal Vaniyambadi', type: 'mahal', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.6838, lng: 78.6225, isActive: true },
  { name: 'Anbu Mahal', type: 'mahal', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.6822, lng: 78.6195, isActive: true },
  { name: 'Raja Mahal Vaniyambadi', type: 'mahal', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.6818, lng: 78.6240, isActive: true },
  { name: 'Sri Lakshmi Mahal', type: 'mahal', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.6855, lng: 78.6205, isActive: true },
  { name: 'Taj Mahal Function Hall', type: 'mahal', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.6808, lng: 78.6175, isActive: true },
  { name: 'Bismillah Mahal', type: 'mahal', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.6845, lng: 78.6188, isActive: true },
  { name: 'Green Park Mahal', type: 'mahal', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.6860, lng: 78.6235, isActive: true },
  { name: 'Sree Annapoorna Mahal', type: 'mahal', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.6832, lng: 78.6158, isActive: true },

  // Schools
  { name: 'Government Higher Secondary School Vaniyambadi', type: 'school', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.6840, lng: 78.6210, isActive: true },
  { name: 'Islamiah Girls Higher Secondary School', type: 'school', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.6825, lng: 78.6185, isActive: true },
  { name: 'Islamiah Boys Higher Secondary School', type: 'school', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.6830, lng: 78.6178, isActive: true },
  { name: 'St. Marys School Vaniyambadi', type: 'school', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.6848, lng: 78.6195, isActive: true },
  { name: 'Crescent Matriculation School', type: 'school', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.6812, lng: 78.6228, isActive: true },

  // Colleges
  { name: 'Islamiah College Vaniyambadi', type: 'college', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.6820, lng: 78.6170, isActive: true },
  { name: 'Islamiah Womens Arts College', type: 'college', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.6815, lng: 78.6165, isActive: true },
  { name: 'Government Arts College Jolarpet', type: 'college', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.5625, lng: 78.5740, isActive: true },

  // Temples
  { name: 'Arulmigu Mariyamman Temple', type: 'temple', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.6828, lng: 78.6205, isActive: true },
  { name: 'Vinayagar Temple Vaniyambadi', type: 'temple', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.6822, lng: 78.6218, isActive: true },
  { name: 'Murugan Temple Vaniyambadi', type: 'temple', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.6835, lng: 78.6235, isActive: true },
  { name: 'Perumal Temple', type: 'temple', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.6818, lng: 78.6192, isActive: true },

  // Mosques
  { name: 'Jamia Masjid Vaniyambadi', type: 'mosque', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.6825, lng: 78.6195, isActive: true },
  { name: 'Big Mosque Vaniyambadi', type: 'mosque', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.6830, lng: 78.6188, isActive: true },
  { name: 'Dargah Vaniyambadi', type: 'mosque', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.6815, lng: 78.6178, isActive: true },

  // Markets
  { name: 'Vaniyambadi Main Market', type: 'market', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.6823, lng: 78.6202, isActive: true },
  { name: 'Vegetable Market Vaniyambadi', type: 'market', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.6827, lng: 78.6198, isActive: true },
  { name: 'Moolakadai Vaniyambadi', type: 'market', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.6820, lng: 78.6190, isActive: true },
  { name: 'Leather Market Vaniyambadi', type: 'market', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.6838, lng: 78.6212, isActive: true },

  // Petrol Bunks
  { name: 'Indian Oil Petrol Bunk Vaniyambadi', type: 'petrol', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.6850, lng: 78.6190, isActive: true },
  { name: 'HP Petrol Bunk Vaniyambadi', type: 'petrol', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.6805, lng: 78.6225, isActive: true },
  { name: 'Bharat Petroleum Vaniyambadi', type: 'petrol', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.6862, lng: 78.6178, isActive: true },

  // Banks
  { name: 'SBI Vaniyambadi', type: 'bank', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.6826, lng: 78.6205, isActive: true },
  { name: 'Indian Bank Vaniyambadi', type: 'bank', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.6832, lng: 78.6198, isActive: true },
  { name: 'Canara Bank Vaniyambadi', type: 'bank', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.6820, lng: 78.6215, isActive: true },
  { name: 'HDFC Bank Vaniyambadi', type: 'bank', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.6835, lng: 78.6192, isActive: true },
  { name: 'ICICI Bank Vaniyambadi', type: 'bank', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.6828, lng: 78.6210, isActive: true },

  // Towns
  { name: 'Vaniyambadi', type: 'town', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.6819, lng: 78.6208, isActive: true },
  { name: 'Alangayam', type: 'town', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.6234, lng: 78.7512, isActive: true },
  { name: 'Jolarpet', type: 'town', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.5620, lng: 78.5730, isActive: true },
  { name: 'Kethandapatti', type: 'town', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.6450, lng: 78.6380, isActive: true },
  { name: 'Pernambut', type: 'town', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.9358, lng: 78.7192, isActive: true },
  { name: 'Yelagiri', type: 'town', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.5795, lng: 78.6380, isActive: true },

  // Villages - Vaniyambadi Taluk
  { name: 'Odugathur', type: 'village', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.7050, lng: 78.5920, isActive: true },
  { name: 'Pallalakuppam', type: 'village', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.6950, lng: 78.6100, isActive: true },
  { name: 'Vellakuttai', type: 'village', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.6720, lng: 78.6350, isActive: true },
  { name: 'Melsanankuppam', type: 'village', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.6680, lng: 78.6420, isActive: true },
  { name: 'Keelasanankuppam', type: 'village', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.6650, lng: 78.6450, isActive: true },
  { name: 'Chinnapallikuppam', type: 'village', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.6580, lng: 78.6280, isActive: true },
  { name: 'Periyapallikuppam', type: 'village', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.6620, lng: 78.6320, isActive: true },
  { name: 'Thuthipet', type: 'village', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.6480, lng: 78.6150, isActive: true },
  { name: 'Kavalur', type: 'village', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.6920, lng: 78.5980, isActive: true },
  { name: 'Valayankuppam', type: 'village', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.6750, lng: 78.5850, isActive: true },
  { name: 'Sempalli', type: 'village', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.6550, lng: 78.6520, isActive: true },
  { name: 'Madhanur', type: 'village', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.6420, lng: 78.6680, isActive: true },
  { name: 'Thirumani', type: 'village', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.6380, lng: 78.5920, isActive: true },
  { name: 'Morasapalli', type: 'village', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.7120, lng: 78.6050, isActive: true },
  { name: 'Ramanathapuram', type: 'village', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.6880, lng: 78.6480, isActive: true },
  { name: 'Agaram', type: 'village', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.6780, lng: 78.5780, isActive: true },
  { name: 'Jaffrabad', type: 'village', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.6620, lng: 78.6080, isActive: true },
  { name: 'Velam', type: 'village', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.7020, lng: 78.6280, isActive: true },
  { name: 'Balur', type: 'village', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.6320, lng: 78.6380, isActive: true },
  { name: 'Lakshmipuram', type: 'village', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.6750, lng: 78.6550, isActive: true },
  { name: 'Santhapettai', type: 'village', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.6480, lng: 78.5850, isActive: true },
  { name: 'Kothur', type: 'village', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.7180, lng: 78.5920, isActive: true },
  { name: 'Kokkeri', type: 'village', taluk: 'Vaniyambadi', district: 'Thirupathur', lat: 12.6280, lng: 78.6120, isActive: true },

  // === TIRUPATHUR TALUK ===
  { name: 'Tirupathur Town', type: 'town', taluk: 'Tirupathur', district: 'Thirupathur', lat: 12.4944, lng: 78.5730, isActive: true },
  { name: 'Tirupathur Bus Stand', type: 'busstand', taluk: 'Tirupathur', district: 'Thirupathur', lat: 12.4950, lng: 78.5725, isActive: true },
  { name: 'Tirupathur New Bus Stand', type: 'busstand', taluk: 'Tirupathur', district: 'Thirupathur', lat: 12.4960, lng: 78.5740, isActive: true },
  { name: 'Tirupathur Railway Station', type: 'railway', taluk: 'Tirupathur', district: 'Thirupathur', lat: 12.4940, lng: 78.5720, isActive: true },
  { name: 'Government Hospital Tirupathur', type: 'hospital', taluk: 'Tirupathur', district: 'Thirupathur', lat: 12.4955, lng: 78.5750, isActive: true },
  { name: 'District Hospital Tirupathur', type: 'hospital', taluk: 'Tirupathur', district: 'Thirupathur', lat: 12.4965, lng: 78.5760, isActive: true },
  { name: 'Sri Venkateswara Mahal Tirupathur', type: 'mahal', taluk: 'Tirupathur', district: 'Thirupathur', lat: 12.4970, lng: 78.5735, isActive: true },
  { name: 'Lakshmi Mahal Tirupathur', type: 'mahal', taluk: 'Tirupathur', district: 'Thirupathur', lat: 12.4935, lng: 78.5745, isActive: true },
  { name: 'Brahmapureeswarar Temple', type: 'temple', taluk: 'Tirupathur', district: 'Thirupathur', lat: 12.4948, lng: 78.5728, isActive: true },
  { name: 'Natham', type: 'village', taluk: 'Tirupathur', district: 'Thirupathur', lat: 12.4820, lng: 78.5650, isActive: true },
  { name: 'Koratti', type: 'village', taluk: 'Tirupathur', district: 'Thirupathur', lat: 12.4750, lng: 78.5580, isActive: true },
  { name: 'Thimmanamuthur', type: 'village', taluk: 'Tirupathur', district: 'Thirupathur', lat: 12.5080, lng: 78.5850, isActive: true },
  { name: 'Nallur', type: 'village', taluk: 'Tirupathur', district: 'Thirupathur', lat: 12.4680, lng: 78.5920, isActive: true },

  // === AMBUR TALUK ===
  { name: 'Ambur Town', type: 'town', taluk: 'Ambur', district: 'Thirupathur', lat: 12.7921, lng: 78.7166, isActive: true },
  { name: 'Ambur Bus Stand', type: 'busstand', taluk: 'Ambur', district: 'Thirupathur', lat: 12.7925, lng: 78.7170, isActive: true },
  { name: 'Ambur Railway Station', type: 'railway', taluk: 'Ambur', district: 'Thirupathur', lat: 12.7915, lng: 78.7160, isActive: true },
  { name: 'Government Hospital Ambur', type: 'hospital', taluk: 'Ambur', district: 'Thirupathur', lat: 12.7935, lng: 78.7180, isActive: true },
  { name: 'ESI Hospital Ambur', type: 'hospital', taluk: 'Ambur', district: 'Thirupathur', lat: 12.7940, lng: 78.7150, isActive: true },
  { name: 'Grand Mahal Ambur', type: 'mahal', taluk: 'Ambur', district: 'Thirupathur', lat: 12.7930, lng: 78.7185, isActive: true },
  { name: 'Royal Mahal Ambur', type: 'mahal', taluk: 'Ambur', district: 'Thirupathur', lat: 12.7918, lng: 78.7175, isActive: true },
  { name: 'Ambur Biryani Street', type: 'landmark', taluk: 'Ambur', district: 'Thirupathur', lat: 12.7922, lng: 78.7168, isActive: true },
  { name: 'Ambur Leather Market', type: 'market', taluk: 'Ambur', district: 'Thirupathur', lat: 12.7928, lng: 78.7162, isActive: true },
  { name: 'Oomerabad', type: 'village', taluk: 'Ambur', district: 'Thirupathur', lat: 12.7650, lng: 78.7350, isActive: true },
  { name: 'Vinnamangalam', type: 'village', taluk: 'Ambur', district: 'Thirupathur', lat: 12.7780, lng: 78.6980, isActive: true },
  { name: 'Veppur', type: 'village', taluk: 'Ambur', district: 'Thirupathur', lat: 12.8050, lng: 78.7280, isActive: true },

  // === NATRAMPALLI TALUK ===
  { name: 'Natrampalli Town', type: 'town', taluk: 'Natrampalli', district: 'Thirupathur', lat: 12.5148, lng: 78.4128, isActive: true },
  { name: 'Natrampalli Bus Stand', type: 'busstand', taluk: 'Natrampalli', district: 'Thirupathur', lat: 12.5152, lng: 78.4132, isActive: true },
  { name: 'Government Hospital Natrampalli', type: 'hospital', taluk: 'Natrampalli', district: 'Thirupathur', lat: 12.5155, lng: 78.4138, isActive: true },
  { name: 'Pudupet', type: 'village', taluk: 'Natrampalli', district: 'Thirupathur', lat: 12.5020, lng: 78.4250, isActive: true },
  { name: 'Narayanapuram', type: 'village', taluk: 'Natrampalli', district: 'Thirupathur', lat: 12.5280, lng: 78.4050, isActive: true },

  // === NEARBY CITIES ===
  { name: 'Vellore', type: 'city', taluk: 'Vellore', district: 'Vellore', lat: 12.9165, lng: 79.1325, isActive: true },
  { name: 'Vellore Bus Stand', type: 'busstand', taluk: 'Vellore', district: 'Vellore', lat: 12.9170, lng: 79.1330, isActive: true },
  { name: 'CMC Hospital Vellore', type: 'hospital', taluk: 'Vellore', district: 'Vellore', lat: 12.9250, lng: 79.1380, isActive: true },
  { name: 'Krishnagiri', type: 'city', taluk: 'Krishnagiri', district: 'Krishnagiri', lat: 12.5266, lng: 78.2149, isActive: true },
  { name: 'Krishnagiri Bus Stand', type: 'busstand', taluk: 'Krishnagiri', district: 'Krishnagiri', lat: 12.5270, lng: 78.2155, isActive: true },
  { name: 'Bangalore', type: 'city', taluk: 'Bangalore', district: 'Bangalore', lat: 12.9716, lng: 77.5946, isActive: true },
  { name: 'Chennai', type: 'city', taluk: 'Chennai', district: 'Chennai', lat: 13.0827, lng: 80.2707, isActive: true },
];

// Search locations by query
export function searchLocations(query: string): Omit<Location, 'id'>[] {
  if (!query || query.length < 2) return [];

  const lowerQuery = query.toLowerCase();
  return LOCATIONS.filter(
    (loc) =>
      loc.name.toLowerCase().includes(lowerQuery) ||
      loc.taluk.toLowerCase().includes(lowerQuery) ||
      loc.type.toLowerCase().includes(lowerQuery)
  ).slice(0, 10);
}

// Get locations by type
export function getLocationsByType(type: LocationType): Omit<Location, 'id'>[] {
  return LOCATIONS.filter((loc) => loc.type === type);
}

// Get locations by taluk
export function getLocationsByTaluk(taluk: string): Omit<Location, 'id'>[] {
  return LOCATIONS.filter((loc) => loc.taluk.toLowerCase() === taluk.toLowerCase());
}

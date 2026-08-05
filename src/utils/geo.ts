import { CRMStage } from '../types';

/**
 * Calculates distance in kilometers between two lat/lng coordinates (Haversine formula)
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Stage labels and colors for the CRM
 */
export const CRM_STAGE_CONFIG: Record<
  CRMStage,
  { label: string; badgeBg: string; badgeText: string; border: string; dotColor: string }
> = {
  notknow: {
    label: 'Not Known',
    badgeBg: 'bg-slate-100 dark:bg-slate-800',
    badgeText: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-300 dark:border-slate-700',
    dotColor: '#64748b',
  },
  viewed: {
    label: 'Viewed / Researched',
    badgeBg: 'bg-blue-50 dark:bg-blue-950/50',
    badgeText: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-300 dark:border-blue-800',
    dotColor: '#3b82f6',
  },
  contacted: {
    label: 'Contacted',
    badgeBg: 'bg-purple-50 dark:bg-purple-950/50',
    badgeText: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-300 dark:border-purple-800',
    dotColor: '#a855f7',
  },
  lead: {
    label: 'Lead / Warm',
    badgeBg: 'bg-amber-50 dark:bg-amber-950/50',
    badgeText: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-300 dark:border-amber-800',
    dotColor: '#f59e0b',
  },
  partner: {
    label: 'Partner',
    badgeBg: 'bg-indigo-50 dark:bg-indigo-950/50',
    badgeText: 'text-indigo-700 dark:text-indigo-300',
    border: 'border-indigo-300 dark:border-indigo-800',
    dotColor: '#6366f1',
  },
  customer: {
    label: 'Customer / Client',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/50',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-300 dark:border-emerald-800',
    dotColor: '#10b981',
  },
  'ex-customer': {
    label: 'Ex-Customer',
    badgeBg: 'bg-rose-50 dark:bg-rose-950/50',
    badgeText: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-300 dark:border-rose-800',
    dotColor: '#f43f5e',
  },
};

/**
 * Extracts YouTube handle or video/channel ID from URL or formats it cleanly
 */
export function parseYouTubeChannel(url: string): { handle: string; cleanUrl: string } {
  if (!url) return { handle: 'YouTube Channel', cleanUrl: '#' };
  let cleanUrl = url.trim();
  if (!cleanUrl.startsWith('http')) {
    cleanUrl = 'https://' + cleanUrl;
  }
  
  try {
    const parsed = new URL(cleanUrl);
    const pathParts = parsed.pathname.split('/').filter(Boolean);
    
    if (parsed.pathname.includes('@')) {
      const handlePart = parsed.pathname.substring(parsed.pathname.indexOf('@'));
      return { handle: handlePart, cleanUrl };
    }
    if (pathParts.length > 0) {
      return { handle: `@${pathParts[pathParts.length - 1]}`, cleanUrl };
    }
  } catch (e) {
    // Return default
  }
  return { handle: 'YouTube Channel', cleanUrl };
}

/**
 * Pre-defined coordinates for popular cities worldwide to auto-fill lat/lng when typing location
 */
export const KNOWN_CITY_COORDINATES: Record<string, { lat: number; lng: number; country: string }> = {
  'New York': { lat: 40.7128, lng: -74.0060, country: 'USA' },
  'Los Angeles': { lat: 34.0522, lng: -118.2437, country: 'USA' },
  'Austin': { lat: 30.2672, lng: -97.7431, country: 'USA' },
  'San Francisco': { lat: 37.7749, lng: -122.4194, country: 'USA' },
  'Chicago': { lat: 41.8781, lng: -87.6298, country: 'USA' },
  'Miami': { lat: 25.7617, lng: -80.1918, country: 'USA' },
  'London': { lat: 51.5074, lng: -0.1278, country: 'United Kingdom' },
  'Manchester': { lat: 53.4808, lng: -2.2426, country: 'United Kingdom' },
  'São Paulo': { lat: -23.5505, lng: -46.6333, country: 'Brazil' },
  'Sao Paulo': { lat: -23.5505, lng: -46.6333, country: 'Brazil' },
  'Itapetininga': { lat: -23.5916, lng: -48.0531, country: 'Brazil' },
  'Sorocaba': { lat: -23.5015, lng: -47.4580, country: 'Brazil' },
  'Rio de Janeiro': { lat: -22.9068, lng: -43.1729, country: 'Brazil' },
  'Florianópolis': { lat: -27.5954, lng: -48.5480, country: 'Brazil' },
  'Curitiba': { lat: -25.4284, lng: -49.2733, country: 'Brazil' },
  'Belo Horizonte': { lat: -19.9167, lng: -43.9345, country: 'Brazil' },
  'Brasília': { lat: -15.7975, lng: -47.8919, country: 'Brazil' },
  'Porto Alegre': { lat: -30.0346, lng: -51.2177, country: 'Brazil' },
  'Campinas': { lat: -22.9099, lng: -47.0626, country: 'Brazil' },
  'Santos': { lat: -23.9608, lng: -46.3339, country: 'Brazil' },
  'Recife': { lat: -8.0476, lng: -34.8770, country: 'Brazil' },
  'Salvador': { lat: -12.9777, lng: -38.5016, country: 'Brazil' },
  'Fortaleza': { lat: -3.7319, lng: -38.5267, country: 'Brazil' },
  'Paris': { lat: 48.8566, lng: 2.3522, country: 'France' },
  'Berlin': { lat: 52.5200, lng: 13.4050, country: 'Germany' },
  'Milano': { lat: 45.4642, lng: 9.1896, country: 'Italy' },
  'Milan': { lat: 45.4642, lng: 9.1896, country: 'Italy' },
  'Rome': { lat: 41.9028, lng: 12.4964, country: 'Italy' },
  'Tokyo': { lat: 35.6762, lng: 139.6503, country: 'Japan' },
  'Sydney': { lat: -33.8688, lng: 151.2093, country: 'Australia' },
  'Toronto': { lat: 43.6532, lng: -79.3832, country: 'Canada' },
  'Madrid': { lat: 40.4168, lng: -3.7038, country: 'Spain' },
  'Barcelona': { lat: 41.3851, lng: 2.1734, country: 'Spain' },
  'Mexico City': { lat: 19.4326, lng: -99.1332, country: 'Mexico' },
  'Buenos Aires': { lat: -34.6037, lng: -58.3816, country: 'Argentina' },
  'Lisbon': { lat: 38.7223, lng: -9.1393, country: 'Portugal' },
  'Porto': { lat: 41.1579, lng: -8.6291, country: 'Portugal' },
};

/**
 * Resolves lat/lng for any city globally, first checking local dictionary, then fetching via Nominatim if needed
 */
export async function resolveGeocode(
  city: string,
  state?: string,
  country?: string
): Promise<{ lat: number; lng: number }> {
  const cleanCity = (city || '').trim();
  if (!cleanCity) return { lat: -23.5505, lng: -46.6333 }; // Default São Paulo

  // 1. Direct dictionary lookup
  const key = Object.keys(KNOWN_CITY_COORDINATES).find(
    (k) => k.toLowerCase() === cleanCity.toLowerCase()
  );
  if (key && KNOWN_CITY_COORDINATES[key]) {
    return {
      lat: KNOWN_CITY_COORDINATES[key].lat,
      lng: KNOWN_CITY_COORDINATES[key].lng,
    };
  }

  // 2. Fetch via OpenStreetMap Nominatim
  try {
    const query = [cleanCity, state, country].filter(Boolean).join(', ');
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`
    );
    if (res.ok) {
      const data = await res.json();
      if (data && data.length > 0 && data[0].lat && data[0].lon) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
        };
      }
    }
  } catch (err) {
    // Network fallback
  }

  // Fallback to São Paulo coordinates if not found
  return { lat: -23.5505, lng: -46.6333 };
}


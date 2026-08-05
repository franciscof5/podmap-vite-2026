import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Loader2, Navigation, Check } from 'lucide-react';

export interface LocationData {
  formattedLocation: string;
  city: string;
  state: string;
  country: string;
  lat: number;
  lng: number;
}

interface LocationAutocompleteProps {
  value: string;
  onChange: (location: LocationData) => void;
  placeholder?: string;
  className?: string;
}

interface CityOption {
  city: string;
  state: string;
  country: string;
  lat: number;
  lng: number;
  formatted: string;
}

export const PRESET_WORLD_CITIES: CityOption[] = [
  { city: 'São Paulo', state: 'SP', country: 'Brazil', lat: -23.5505, lng: -46.6333, formatted: 'São Paulo, SP, Brazil' },
  { city: 'Rio de Janeiro', state: 'RJ', country: 'Brazil', lat: -22.9068, lng: -43.1729, formatted: 'Rio de Janeiro, RJ, Brazil' },
  { city: 'Florianópolis', state: 'SC', country: 'Brazil', lat: -27.5954, lng: -48.5480, formatted: 'Florianópolis, SC, Brazil' },
  { city: 'Curitiba', state: 'PR', country: 'Brazil', lat: -25.4284, lng: -49.2733, formatted: 'Curitiba, PR, Brazil' },
  { city: 'Belo Horizonte', state: 'MG', country: 'Brazil', lat: -19.9167, lng: -43.9345, formatted: 'Belo Horizonte, MG, Brazil' },
  { city: 'Brasília', state: 'DF', country: 'Brazil', lat: -15.7975, lng: -47.8919, formatted: 'Brasília, DF, Brazil' },
  { city: 'Porto Alegre', state: 'RS', country: 'Brazil', lat: -30.0346, lng: -51.2177, formatted: 'Porto Alegre, RS, Brazil' },
  { city: 'Campinas', state: 'SP', country: 'Brazil', lat: -22.9099, lng: -47.0626, formatted: 'Campinas, SP, Brazil' },
  { city: 'New York', state: 'NY', country: 'USA', lat: 40.7128, lng: -74.006, formatted: 'New York, NY, USA' },
  { city: 'Los Angeles', state: 'CA', country: 'USA', lat: 34.0522, lng: -118.2437, formatted: 'Los Angeles, CA, USA' },
  { city: 'Austin', state: 'TX', country: 'USA', lat: 30.2672, lng: -97.7431, formatted: 'Austin, TX, USA' },
  { city: 'Miami', state: 'FL', country: 'USA', lat: 25.7617, lng: -80.1918, formatted: 'Miami, FL, USA' },
  { city: 'San Francisco', state: 'CA', country: 'USA', lat: 37.7749, lng: -122.4194, formatted: 'San Francisco, CA, USA' },
  { city: 'Chicago', state: 'IL', country: 'USA', lat: 41.8781, lng: -87.6298, formatted: 'Chicago, IL, USA' },
  { city: 'Milano', state: 'Lombardy', country: 'Italy', lat: 45.4642, lng: 9.1896, formatted: 'Milano, Lombardy, Italy' },
  { city: 'Rome', state: 'Lazio', country: 'Italy', lat: 41.9028, lng: 12.4964, formatted: 'Rome, Lazio, Italy' },
  { city: 'London', state: 'England', country: 'United Kingdom', lat: 51.5074, lng: -0.1278, formatted: 'London, England, United Kingdom' },
  { city: 'Paris', state: 'Île-de-France', country: 'France', lat: 48.8566, lng: 2.3522, formatted: 'Paris, Île-de-France, France' },
  { city: 'Berlin', state: 'Berlin', country: 'Germany', lat: 52.52, lng: 13.405, formatted: 'Berlin, Berlin, Germany' },
  { city: 'Madrid', state: 'Madrid', country: 'Spain', lat: 40.4168, lng: -3.7038, formatted: 'Madrid, Madrid, Spain' },
  { city: 'Lisbon', state: 'Lisbon', country: 'Portugal', lat: 38.7223, lng: -9.1393, formatted: 'Lisbon, Lisbon, Portugal' },
  { city: 'Porto', state: 'Porto', country: 'Portugal', lat: 41.1579, lng: -8.6291, formatted: 'Porto, Porto, Portugal' },
  { city: 'Tokyo', state: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503, formatted: 'Tokyo, Tokyo, Japan' },
  { city: 'Sydney', state: 'NSW', country: 'Australia', lat: -33.8688, lng: 151.2093, formatted: 'Sydney, NSW, Australia' },
  { city: 'Toronto', state: 'ON', country: 'Canada', lat: 43.6532, lng: -79.3832, formatted: 'Toronto, ON, Canada' },
  { city: 'Buenos Aires', state: 'CABA', country: 'Argentina', lat: -34.6037, lng: -58.3816, formatted: 'Buenos Aires, CABA, Argentina' },
  { city: 'Mexico City', state: 'CDMX', country: 'Mexico', lat: 19.4326, lng: -99.1332, formatted: 'Mexico City, CDMX, Mexico' },
];

export const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  value,
  onChange,
  placeholder = 'e.g. New York, NY, USA or São Paulo, SP, Brazil',
  className = '',
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<CityOption[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter local presets and fetch online geocode if needed
  useEffect(() => {
    if (!inputValue || inputValue.trim().length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const q = inputValue.trim().toLowerCase();

    // 1. Instant Preset Matches
    const presetMatches = PRESET_WORLD_CITIES.filter((c) =>
      c.formatted.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q) ||
      c.country.toLowerCase().includes(q) ||
      c.state.toLowerCase().includes(q)
    );

    setSuggestions(presetMatches);
    setIsOpen(true);

    // 2. Debounced Nominatim Fetch for dynamic global search
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(
            inputValue
          )}`
        );
        if (!res.ok) return;
        const data = await res.json();

        if (data && Array.isArray(data) && data.length > 0) {
          const apiSuggestions: CityOption[] = data.map((item: any) => {
            const addr = item.address || {};
            const city =
              addr.city ||
              addr.town ||
              addr.village ||
              addr.municipality ||
              addr.county ||
              item.display_name.split(',')[0] ||
              '';
            const state = addr.state || addr.region || addr.state_district || '';
            const country = addr.country || '';
            const lat = parseFloat(item.lat) || 0;
            const lng = parseFloat(item.lon) || 0;

            const formattedParts = [city, state, country].filter(Boolean);
            const formatted = formattedParts.join(', ');

            return {
              city,
              state,
              country,
              lat,
              lng,
              formatted,
            };
          });

          // Merge without duplicates
          const combined = [...presetMatches];
          apiSuggestions.forEach((apiOpt) => {
            if (!combined.some((c) => c.city.toLowerCase() === apiOpt.city.toLowerCase())) {
              combined.push(apiOpt);
            }
          });

          setSuggestions(combined);
        }
      } catch (err) {
        // Fallback to presets on network error
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [inputValue]);

  const handleSelectOption = (opt: CityOption) => {
    setInputValue(opt.formatted);
    setIsOpen(false);
    onChange({
      formattedLocation: opt.formatted,
      city: opt.city,
      state: opt.state,
      country: opt.country,
      lat: opt.lat,
      lng: opt.lng,
    });
  };

  const handleManualInputChange = (text: string) => {
    setInputValue(text);

    // Parse input text immediately so state/country aren't stale
    const parts = text.split(',').map((p) => p.trim()).filter(Boolean);
    let parsedCity = text.trim();
    let parsedState = '';
    let parsedCountry = '';

    if (parts.length >= 3) {
      parsedCity = parts[0];
      parsedState = parts[1];
      parsedCountry = parts[2];
    } else if (parts.length === 2) {
      parsedCity = parts[0];
      parsedCountry = parts[1];
    } else if (parts.length === 1) {
      parsedCity = parts[0];
      parsedState = '';
      parsedCountry = '';
    }

    // Check if matched preset
    const matchedPreset = PRESET_WORLD_CITIES.find(
      (c) => c.city.toLowerCase() === parsedCity.toLowerCase()
    );

    onChange({
      formattedLocation: text,
      city: parsedCity || 'Unspecified',
      state: matchedPreset ? matchedPreset.state : parsedState,
      country: matchedPreset ? matchedPreset.country : (parsedCountry || 'Brazil'),
      lat: matchedPreset ? matchedPreset.lat : 0,
      lng: matchedPreset ? matchedPreset.lng : 0,
    });
  };

  return (
    <div ref={wrapperRef} className={`relative w-full ${className}`}>
      <div className="relative flex items-center">
        <MapPin className="w-4 h-4 text-rose-400 absolute left-3 pointer-events-none" />
        <input
          type="text"
          value={inputValue}
          onChange={(e) => handleManualInputChange(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-8 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 font-sans"
        />
        {loading ? (
          <Loader2 className="w-4 h-4 text-yellow-400 animate-spin absolute right-3 pointer-events-none" />
        ) : (
          <Search className="w-3.5 h-3.5 text-slate-500 absolute right-3 pointer-events-none" />
        )}
      </div>

      {/* Autocomplete Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl z-[10000] overflow-hidden max-h-60 overflow-y-auto animate-in fade-in duration-150">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-900/80 border-b border-slate-800/80 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Navigation className="w-3 h-3 text-yellow-400" />
              <span>Location Suggestions (Google Maps / OpenStreetMap)</span>
            </span>
          </div>

          <div className="divide-y divide-slate-800/50">
            {suggestions.map((opt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectOption(opt)}
                className="w-full text-left px-3.5 py-2.5 hover:bg-slate-900/90 transition flex items-center gap-2.5 group"
              >
                <div className="p-1.5 rounded-lg bg-slate-900 text-rose-400 group-hover:bg-rose-500/20 transition shrink-0">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-100 group-hover:text-yellow-400 transition truncate">
                    {opt.city}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {[opt.state, opt.country].filter(Boolean).join(', ')}
                  </div>
                </div>
                {inputValue.toLowerCase() === opt.formatted.toLowerCase() && (
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

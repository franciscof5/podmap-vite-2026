import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Podcast, UserLocation } from '../types';
import { CRM_STAGE_CONFIG } from '../utils/geo';
import { Navigation, MapPin, Maximize2, Compass } from 'lucide-react';

interface MapComponentProps {
  podcasts: Podcast[];
  selectedPodcastId: string | null;
  onSelectPodcast: (id: string) => void;
  userLocation: UserLocation | null;
  onRequestUserLocation: () => void;
  isAdmin: boolean;
}

export const MapComponent: React.FC<MapComponentProps> = ({
  podcasts,
  selectedPodcastId,
  onSelectPodcast,
  userLocation,
  onRequestUserLocation,
  isAdmin,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // already initialized

    // Initial center: if user location is available, use that; else default global view
    const initialLat = userLocation ? userLocation.latitude : 20;
    const initialLng = userLocation ? userLocation.longitude : 0;
    const initialZoom = userLocation ? 6 : 2.5;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: initialZoom,
      zoomControl: false, // We will add custom styled zoom control
      minZoom: 2,
      maxZoom: 18,
    });

    // Clean, crisp Dark/Light Tile Layer (CartoDB Positron / Voyager or OpenStreetMap)
    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }
    ).addTo(map);

    // Add Zoom controls at top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Podcast Markers whenever podcasts list or selectedPodcastId changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    podcasts.forEach((podcast) => {
      const isSelected = podcast.id === selectedPodcastId;
      const stageConfig = CRM_STAGE_CONFIG[podcast.stage] || CRM_STAGE_CONFIG.notknow;
      const dotColor = stageConfig.dotColor;

      // Create Custom HTML Icon
      const iconHtml = `
        <div class="podcast-map-pin ${isSelected ? 'scale-125 ring-4 ring-purple-500/80 shadow-2xl z-50' : ''}" 
             style="background-color: ${dotColor}; width: ${isSelected ? '36px' : '28px'}; height: ${isSelected ? '36px' : '28px'}; border: 2.5px solid #ffffff; cursor: pointer;">
          <img src="${podcast.coverImage}" alt="${podcast.name}" class="w-full h-full object-cover rounded-full" onError="this.style.display='none'" />
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-podcast-div-icon',
        iconSize: [isSelected ? 36 : 28, isSelected ? 36 : 28],
        iconAnchor: [isSelected ? 18 : 14, isSelected ? 18 : 14],
      });

      const marker = L.marker([podcast.latitude, podcast.longitude], {
        icon: customIcon,
        title: podcast.name,
      });

      // HTML content for popup
      const popupHtml = `
        <div class="bg-slate-900 text-slate-100 p-3 rounded-lg font-sans">
          <div class="flex items-center gap-2 mb-2">
            <img src="${podcast.coverImage}" class="w-10 h-10 rounded-lg object-cover shadow" />
            <div class="overflow-hidden">
              <h4 class="font-bold text-sm text-white truncate">${podcast.name}</h4>
              <p class="text-[11px] text-slate-400 truncate">${podcast.city}, ${podcast.country}</p>
            </div>
          </div>
          <div class="flex items-center gap-1.5 mb-2 text-[11px]">
            <span class="px-2 py-0.5 rounded bg-purple-950 text-purple-300 font-medium">${podcast.niche}</span>
            <span class="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">${podcast.language}</span>
          </div>
          ${
            isAdmin
              ? `<div class="mb-2 text-[10px] font-bold px-2 py-0.5 rounded inline-block ${stageConfig.badgeBg} ${stageConfig.badgeText}">${stageConfig.label}</div>`
              : ''
          }
          <button id="view-btn-${podcast.id}" class="w-full mt-1 bg-purple-600 hover:bg-purple-500 text-white font-semibold py-1 px-2 text-xs rounded shadow transition cursor-pointer">
            View Details & Channel
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml, { closeButton: false, offset: [0, -10] });

      marker.on('click', () => {
        onSelectPodcast(podcast.id);
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`view-btn-${podcast.id}`);
        if (btn) {
          btn.addEventListener('click', () => {
            onSelectPodcast(podcast.id);
          });
        }
      });

      markersLayer.addLayer(marker);

      // If this is the selected podcast, pan to it and open popup
      if (isSelected) {
        map.flyTo([podcast.latitude, podcast.longitude], Math.max(map.getZoom(), 7), {
          duration: 1.2,
        });
        marker.openPopup();
      }
    });
  }, [podcasts, selectedPodcastId, isAdmin]);

  // Update User Location Marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userLocation) {
      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([userLocation.latitude, userLocation.longitude]);
      } else {
        const userIcon = L.divIcon({
          html: `<div class="user-location-marker"></div>`,
          className: 'user-marker-container',
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });

        const marker = L.marker([userLocation.latitude, userLocation.longitude], {
          icon: userIcon,
          title: 'Your Location',
          zIndexOffset: 1000,
        }).addTo(map);

        marker.bindTooltip('You are here', { permanent: false, direction: 'top' });
        userMarkerRef.current = marker;
      }
    }
  }, [userLocation]);

  const handleCenterOnUser = () => {
    if (userLocation && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([userLocation.latitude, userLocation.longitude], 8, {
        duration: 1.2,
      });
    } else {
      onRequestUserLocation();
    }
  };

  const handleResetZoom = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([20, 0], 2.5, { duration: 1.2 });
    }
  };

  return (
    <div className="relative w-full h-[400px] sm:h-[480px] lg:h-[520px] rounded-2xl overflow-hidden border border-slate-800 shadow-xl bg-slate-950 group">
      
      {/* Map DOM Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Map Floating Controls */}
      <div className="absolute top-4 left-4 z-[400] flex flex-col gap-2">
        <button
          onClick={handleCenterOnUser}
          className="bg-slate-900/90 hover:bg-slate-800 text-slate-100 p-2.5 rounded-xl border border-slate-700/80 shadow-lg backdrop-blur flex items-center gap-2 text-xs font-semibold transition group-hover:border-purple-500/50"
          title="Center map on your location"
        >
          <Navigation className="w-4 h-4 text-purple-400 animate-pulse" />
          <span className="hidden sm:inline">Near Me</span>
        </button>

        <button
          onClick={handleResetZoom}
          className="bg-slate-900/90 hover:bg-slate-800 text-slate-100 p-2.5 rounded-xl border border-slate-700/80 shadow-lg backdrop-blur flex items-center gap-2 text-xs font-semibold transition"
          title="Zoom out to Global View"
        >
          <Compass className="w-4 h-4 text-indigo-400" />
          <span className="hidden sm:inline">Global View</span>
        </button>
      </div>

      {/* Map Legend Pill */}
      <div className="absolute bottom-4 left-4 z-[400] bg-slate-900/90 backdrop-blur border border-slate-800 px-3 py-1.5 rounded-full text-xs text-slate-300 flex items-center gap-3 shadow-lg">
        <span className="flex items-center gap-1.5 font-medium">
          <MapPin className="w-3.5 h-3.5 text-purple-400" />
          {podcasts.length} Podcasts on Map
        </span>
        {userLocation && (
          <span className="text-[11px] text-emerald-400 flex items-center gap-1 border-l border-slate-700 pl-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Location Detected
          </span>
        )}
      </div>

    </div>
  );
};

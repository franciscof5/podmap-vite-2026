import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Podcast, UserLocation } from '../types';
import { CRM_STAGE_CONFIG } from '../utils/geo';
import { Navigation, MapPin } from 'lucide-react';

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
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  // Initialize Map with OpenStreetMap
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // already initialized

    // Initial center: if user location is available, use that; else default center
    const initialLat = userLocation ? userLocation.latitude : 20;
    const initialLng = userLocation ? userLocation.longitude : 0;
    const initialZoom = userLocation ? 6 : 2.5;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: initialZoom,
      zoomControl: false,
      scrollWheelZoom: false,
      minZoom: 2,
      maxZoom: 19,
    });

    // Add Zoom controls at top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // OpenStreetMap standard tile layer (100% free, no API key required)
    const tileLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    tileLayerRef.current = tileLayer;

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
      const isStudio = podcast.entityType === 'studio';
      const stageConfig = CRM_STAGE_CONFIG[podcast.stage] || CRM_STAGE_CONFIG.notknow;
      const dotColor = isStudio ? '#f59e0b' : stageConfig.dotColor;

      const entityLabel = isStudio
        ? `STUDIO: ${(podcast.studioType || 'PODCAST').toUpperCase()}`
        : 'PODCAST';

      const iconHtml = `
        <div class="podcast-map-pin ${
          isSelected ? 'scale-125 ring-4 ring-amber-400/90 shadow-2xl z-50' : ''
        }" 
             style="background-color: ${dotColor}; width: ${
        isSelected ? '38px' : '30px'
      }; height: ${isSelected ? '38px' : '30px'}; border: 2.5px solid ${
        isStudio ? '#fef08a' : '#ffffff'
      }; cursor: pointer; position: relative;">
          <img src="${podcast.coverImage}" alt="${
        podcast.name
      }" class="w-full h-full object-cover rounded-full" onError="this.style.display='none'" />
          ${
            isStudio
              ? `<div style="position: absolute; bottom: -2px; right: -2px; background: #b45309; color: #fef08a; font-size: 8px; font-weight: 800; padding: 1px 3px; border-radius: 4px; border: 1px solid #fef08a;">STU</div>`
              : ''
          }
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-podcast-div-icon',
        iconSize: [isSelected ? 38 : 30, isSelected ? 38 : 30],
        iconAnchor: [isSelected ? 19 : 15, isSelected ? 19 : 15],
      });

      const marker = L.marker([podcast.latitude, podcast.longitude], {
        icon: customIcon,
        title: podcast.name,
      });

      const popupHtml = `
        <div class="bg-slate-900 text-slate-100 p-3 rounded-lg font-sans shadow-xl border border-slate-800 max-w-[240px]">
          <div class="flex items-center gap-2 mb-2">
            <img src="${podcast.coverImage}" class="w-10 h-10 rounded-lg object-cover shadow border border-slate-700" />
            <div class="overflow-hidden">
              <div class="flex items-center gap-1 mb-0.5">
                <span class="px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase tracking-wider ${
                  isStudio
                    ? 'bg-amber-950 text-amber-300 border border-amber-700/60'
                    : 'bg-purple-950 text-purple-300 border border-purple-800/60'
                }">
                  ${entityLabel}
                </span>
              </div>
              <h4 class="font-bold text-xs text-white truncate">${podcast.name}</h4>
              <p class="text-[10px] text-slate-400 truncate">${podcast.city}, ${podcast.country}</p>
            </div>
          </div>
          
          ${
            isStudio && podcast.hourlyRate
              ? `<div class="mb-1.5 text-[11px] font-bold text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40 flex justify-between"><span>Rate:</span> <span>${podcast.hourlyRate}</span></div>`
              : ''
          }

          <div class="flex items-center gap-1 mb-2 text-[10px] flex-wrap">
            <span class="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">${podcast.niche}</span>
            <span class="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">${podcast.language}</span>
          </div>
          ${
            isAdmin
              ? `<div class="mb-2 text-[10px] font-bold px-2 py-0.5 rounded inline-block ${stageConfig.badgeBg} ${stageConfig.badgeText}">${stageConfig.label}</div>`
              : ''
          }
          <button id="view-btn-${podcast.id}" class="w-full mt-1 bg-purple-600 hover:bg-purple-500 text-white font-semibold py-1 px-2 text-xs rounded shadow transition cursor-pointer">
            View Details & Map Card
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

      map.flyTo([userLocation.latitude, userLocation.longitude], 14, {
        duration: 1.2,
      });
    }
  }, [userLocation]);

  const handleCenterOnUser = () => {
    if (userLocation && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([userLocation.latitude, userLocation.longitude], 14, {
        duration: 1.2,
      });
    } else {
      onRequestUserLocation();
    }
  };

  return (
    <div className="relative w-full h-[400px] sm:h-[480px] lg:h-[520px] rounded-2xl overflow-hidden border border-zinc-800/80 shadow-xl bg-zinc-950 group z-0 isolate">
      {/* Map DOM Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Map Floating Controls - Left Side */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <button
          onClick={handleCenterOnUser}
          className="bg-[#121215]/95 hover:bg-zinc-800 text-zinc-100 p-2.5 rounded-xl border border-zinc-700/80 shadow-lg backdrop-blur flex items-center gap-2 text-xs font-semibold transition hover:border-yellow-400/50"
          title="Center map on your location"
        >
          <Navigation className="w-4 h-4 text-yellow-400 animate-pulse" />
          <span className="hidden sm:inline">Near Me</span>
        </button>
      </div>

      {/* Map Legend Pill */}
      <div className="absolute bottom-4 left-4 z-10 bg-[#121215]/95 backdrop-blur border border-zinc-800 px-3.5 py-1.5 rounded-full text-xs text-zinc-300 flex items-center gap-3 shadow-lg flex-wrap">
        <span className="flex items-center gap-1.5 font-bold text-yellow-400">
          <MapPin className="w-3.5 h-3.5 text-yellow-400" />
          {podcasts.filter((p) => p.entityType !== 'studio').length} Podcasts
        </span>
        <span className="flex items-center gap-1.5 font-bold text-amber-400 border-l border-zinc-800 pl-3">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          {podcasts.filter((p) => p.entityType === 'studio').length} Studios
        </span>
        {userLocation && (
          <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1 border-l border-zinc-800 pl-3 hidden sm:flex">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Location Active
          </span>
        )}
      </div>
    </div>
  );
};

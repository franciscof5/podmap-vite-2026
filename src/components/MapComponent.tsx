import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Podcast, UserLocation } from '../types';
import { CRM_STAGE_CONFIG } from '../utils/geo';
import {
  Navigation,
  MapPin,
  Compass,
  Layers,
  Key,
  Check,
  ExternalLink,
  X,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
} from 'lucide-react';

export type BasemapStyle = 'osm' | 'esri-dark' | 'carto-voyager' | 'carto-dark';

interface BasemapOption {
  id: BasemapStyle;
  name: string;
  description: string;
  requiresKey: boolean;
  getUrl: (key: string) => string;
  attribution: string;
  subdomains?: string;
  maxZoom: number;
}

const BASEMAP_OPTIONS: Record<BasemapStyle, BasemapOption> = {
  osm: {
    id: 'osm',
    name: 'OpenStreetMap (Recomendado)',
    description: '100% Gratuito • Sem necessidade de chave API • Completo',
    requiresKey: false,
    getUrl: () => 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
  'esri-dark': {
    id: 'esri-dark',
    name: 'Esri Dark Canvas',
    description: 'Tema Escuro Elegante • Gratuito • Sem necessidade de chave',
    requiresKey: false,
    getUrl: () =>
      'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution:
      'Tiles &copy; <a href="https://www.esri.com/" target="_blank" rel="noopener">Esri</a> &mdash; Esri, DeLorme, NAVTEQ',
    maxZoom: 16,
  },
  'carto-voyager': {
    id: 'carto-voyager',
    name: 'CARTO Voyager',
    description: 'Estilo Vibrante CARTO • Requer Chave de API para não exibir aviso',
    requiresKey: true,
    getUrl: (key: string) =>
      key.trim()
        ? `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?api_key=${encodeURIComponent(
            key.trim()
          )}`
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> &copy; <a href="https://carto.com/" target="_blank" rel="noopener">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19,
  },
  'carto-dark': {
    id: 'carto-dark',
    name: 'CARTO Dark Matter',
    description: 'Estilo Noturno CARTO • Requer Chave de API para não exibir aviso',
    requiresKey: true,
    getUrl: (key: string) =>
      key.trim()
        ? `https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png?api_key=${encodeURIComponent(
            key.trim()
          )}`
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> &copy; <a href="https://carto.com/" target="_blank" rel="noopener">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19,
  },
};

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

  // CARTO API Key state
  const [cartoApiKey, setCartoApiKey] = useState<string>(() => {
    return (
      localStorage.getItem('carto_api_key') ||
      (import.meta as any).env?.VITE_CARTO_API_KEY ||
      ''
    );
  });

  // Basemap style state: defaults to 'osm' if no carto key, or stored user preference
  const [basemapStyle, setBasemapStyle] = useState<BasemapStyle>(() => {
    const saved = localStorage.getItem('map_basemap_style') as BasemapStyle | null;
    if (saved && BASEMAP_OPTIONS[saved]) {
      return saved;
    }
    // Default to OpenStreetMap so no "CARTO.COM API KEY REQUIRED" watermark is shown
    return 'osm';
  });

  // UI Menus / Modals
  const [isLayersMenuOpen, setIsLayersMenuOpen] = useState<boolean>(false);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState<boolean>(false);
  const [keyInput, setKeyInput] = useState<string>(cartoApiKey);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

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
      zoomControl: false,
      scrollWheelZoom: false,
      minZoom: 2,
      maxZoom: 18,
    });

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

  // Sync Basemap Tile Layer whenever basemapStyle or cartoApiKey changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove existing tile layer
    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
      tileLayerRef.current = null;
    }

    const config = BASEMAP_OPTIONS[basemapStyle] || BASEMAP_OPTIONS.osm;
    const url = config.getUrl(cartoApiKey);

    const newTileLayer = L.tileLayer(url, {
      attribution: config.attribution,
      subdomains: config.subdomains || 'abc',
      maxZoom: config.maxZoom,
    }).addTo(map);

    // Ensure tile layer stays behind markers
    newTileLayer.bringToBack();
    tileLayerRef.current = newTileLayer;
  }, [basemapStyle, cartoApiKey]);

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

  const handleResetZoom = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([20, 0], 2.5, { duration: 1.2 });
    }
  };

  const handleSelectStyle = (style: BasemapStyle) => {
    setBasemapStyle(style);
    localStorage.setItem('map_basemap_style', style);
    setIsLayersMenuOpen(false);

    // If selecting a CARTO style without a key, open the key modal to guide the user
    if (BASEMAP_OPTIONS[style].requiresKey && !cartoApiKey.trim()) {
      setIsKeyModalOpen(true);
    }
  };

  const handleSaveKey = () => {
    const cleanKey = keyInput.trim();
    setCartoApiKey(cleanKey);
    localStorage.setItem('carto_api_key', cleanKey);
    setSaveSuccessMsg('Chave CARTO salva com sucesso!');
    setTimeout(() => {
      setSaveSuccessMsg(null);
      setIsKeyModalOpen(false);
    }, 1200);
  };

  const handleClearKey = () => {
    setKeyInput('');
    setCartoApiKey('');
    localStorage.removeItem('carto_api_key');
    // If currently on a CARTO style, switch back to OSM
    if (BASEMAP_OPTIONS[basemapStyle].requiresKey) {
      setBasemapStyle('osm');
      localStorage.setItem('map_basemap_style', 'osm');
    }
    setSaveSuccessMsg('Chave removida. Mapa alternado para OpenStreetMap.');
    setTimeout(() => {
      setSaveSuccessMsg(null);
      setIsKeyModalOpen(false);
    }, 1400);
  };

  const currentOption = BASEMAP_OPTIONS[basemapStyle] || BASEMAP_OPTIONS.osm;
  const isCartoWithoutKey = currentOption.requiresKey && !cartoApiKey.trim();

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

        <button
          onClick={handleResetZoom}
          className="bg-[#121215]/95 hover:bg-zinc-800 text-zinc-100 p-2.5 rounded-xl border border-zinc-700/80 shadow-lg backdrop-blur flex items-center gap-2 text-xs font-semibold transition hover:border-yellow-400/50"
          title="Zoom out to Global View"
        >
          <Compass className="w-4 h-4 text-amber-400" />
          <span className="hidden sm:inline">Global View</span>
        </button>

        {/* Basemap Layer Switcher Button */}
        <div className="relative">
          <button
            onClick={() => setIsLayersMenuOpen(!isLayersMenuOpen)}
            className="bg-[#121215]/95 hover:bg-zinc-800 text-zinc-100 p-2.5 rounded-xl border border-zinc-700/80 shadow-lg backdrop-blur flex items-center gap-2 text-xs font-semibold transition hover:border-yellow-400/50"
            title="Escolher estilo do mapa (OpenStreetMap, Esri, CARTO)"
          >
            <Layers className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Camadas</span>
          </button>

          {/* Layer Switcher Dropdown */}
          {isLayersMenuOpen && (
            <div className="absolute left-0 mt-2 w-64 bg-zinc-900/95 backdrop-blur-md border border-zinc-700/80 rounded-xl shadow-2xl p-2 z-30 text-xs">
              <div className="px-2 py-1.5 font-bold text-zinc-300 border-b border-zinc-800 flex items-center justify-between">
                <span>Estilo do Mapa</span>
                <button
                  onClick={() => setIsLayersMenuOpen(false)}
                  className="text-zinc-500 hover:text-zinc-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="mt-1 flex flex-col gap-1">
                {(Object.keys(BASEMAP_OPTIONS) as BasemapStyle[]).map((key) => {
                  const opt = BASEMAP_OPTIONS[key];
                  const isSelected = basemapStyle === key;
                  return (
                    <button
                      key={key}
                      onClick={() => handleSelectStyle(key)}
                      className={`w-full text-left p-2 rounded-lg transition flex items-start justify-between gap-2 ${
                        isSelected
                          ? 'bg-yellow-400/10 border border-yellow-400/40 text-yellow-300'
                          : 'hover:bg-zinc-800/80 text-zinc-300'
                      }`}
                    >
                      <div>
                        <div className="font-bold flex items-center gap-1.5">
                          {opt.name}
                          {isSelected && <Check className="w-3.5 h-3.5 text-yellow-400" />}
                        </div>
                        <div className="text-[10px] text-zinc-400 mt-0.5">{opt.description}</div>
                      </div>
                      {opt.requiresKey && (
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase shrink-0 ${
                            cartoApiKey
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}
                        >
                          {cartoApiKey ? 'Chave Ativa' : 'Requer Chave'}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Quick Link to configure CARTO API Key */}
              <div className="mt-2 pt-2 border-t border-zinc-800 flex justify-between items-center px-1">
                <button
                  onClick={() => {
                    setIsLayersMenuOpen(false);
                    setIsKeyModalOpen(true);
                  }}
                  className="text-[11px] text-yellow-400 hover:text-yellow-300 flex items-center gap-1 font-semibold"
                >
                  <Key className="w-3 h-3" />
                  {cartoApiKey ? 'Gerenciar Chave CARTO' : 'Inserir Chave CARTO'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* CARTO Key indicator / shortcut button */}
        <button
          onClick={() => setIsKeyModalOpen(true)}
          className={`p-2.5 rounded-xl border shadow-lg backdrop-blur flex items-center gap-2 text-xs font-semibold transition ${
            cartoApiKey
              ? 'bg-[#121215]/95 border-emerald-600/60 text-emerald-300 hover:bg-zinc-800'
              : 'bg-[#121215]/95 border-zinc-700/80 text-zinc-300 hover:border-yellow-400/50 hover:bg-zinc-800'
          }`}
          title={cartoApiKey ? 'Chave CARTO Configurada' : 'Configurar Chave CARTO'}
        >
          <Key
            className={`w-4 h-4 ${cartoApiKey ? 'text-emerald-400' : 'text-amber-400'}`}
          />
          <span className="hidden sm:inline">
            {cartoApiKey ? 'CARTO Key: OK' : 'CARTO Key'}
          </span>
        </button>
      </div>

      {/* Alert Warning Pill when CARTO is active without an API Key */}
      {isCartoWithoutKey && (
        <div className="absolute top-4 right-14 z-20 max-w-sm bg-zinc-950/95 border border-amber-500/80 text-amber-200 p-2.5 rounded-xl shadow-2xl backdrop-blur flex items-start gap-2.5 text-xs animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-white text-[11px] leading-tight">
              Aviso: carto.com API KEY REQUIRED
            </p>
            <p className="text-[10px] text-zinc-300 mt-1 leading-snug">
              A CARTO agora exige chave para remover a marca d'água dos azulejos.
            </p>
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={() => setIsKeyModalOpen(true)}
                className="bg-yellow-400 hover:bg-yellow-300 text-black text-[10px] font-extrabold px-2.5 py-1 rounded shadow cursor-pointer transition active:scale-95"
              >
                Inserir Chave CARTO
              </button>
              <button
                onClick={() => handleSelectStyle('osm')}
                className="bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-semibold px-2 py-1 rounded border border-zinc-700 cursor-pointer transition"
              >
                Usar OpenStreetMap (Sem Chave)
              </button>
            </div>
          </div>
        </div>
      )}

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
        <span className="text-[10px] text-zinc-400 font-medium border-l border-zinc-800 pl-3 hidden md:inline">
          Mapa: <strong className="text-zinc-200">{currentOption.name.split(' ')[0]}</strong>
        </span>
        {userLocation && (
          <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1 border-l border-zinc-800 pl-3 hidden sm:flex">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Location Active
          </span>
        )}
      </div>

      {/* --- CARTO API KEY CONFIGURATION MODAL --- */}
      {isKeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-zinc-100">
            <button
              onClick={() => setIsKeyModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">Chave de API CARTO</h3>
                <p className="text-xs text-zinc-400">
                  Resolução do aviso "carto.com API KEY REQUIRED"
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-zinc-300">
              <div className="bg-zinc-950/70 border border-zinc-800 rounded-xl p-3.5 space-y-2">
                <p className="text-zinc-300 leading-relaxed">
                  A <strong>CARTO</strong> agora exige uma chave de API para servir azulejos rasterizados
                  sem a mensagem d'água <em>"API KEY REQUIRED"</em>.
                </p>
                <div className="flex items-center justify-between pt-1">
                  <a
                    href="https://carto.com/help/basemaps/basemap-api-keys/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-400 hover:text-amber-300 font-semibold inline-flex items-center gap-1 hover:underline"
                  >
                    <span>Como obter uma chave gratuita na CARTO</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-200 mb-1.5">
                  Insira sua CARTO API Key:
                </label>
                <input
                  type="text"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="Ex: default_public_api_key_..."
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-400 font-mono"
                />
              </div>

              {saveSuccessMsg && (
                <div className="p-2.5 rounded-lg bg-emerald-950/50 border border-emerald-800 text-emerald-300 font-semibold text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={handleSaveKey}
                  className="flex-1 bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold py-2 px-4 rounded-xl text-xs transition shadow cursor-pointer"
                >
                  Salvar Chave
                </button>
                {cartoApiKey && (
                  <button
                    onClick={handleClearKey}
                    className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold py-2 px-3 rounded-xl text-xs border border-zinc-700 transition cursor-pointer"
                  >
                    Remover
                  </button>
                )}
              </div>

              {/* Free Alternative Note */}
              <div className="mt-3 pt-3 border-t border-zinc-800/80 flex flex-col gap-2">
                <p className="text-[11px] text-zinc-400">
                  💡 <strong>Não quer criar uma chave CARTO?</strong>
                </p>
                <button
                  onClick={() => {
                    handleSelectStyle('osm');
                    setIsKeyModalOpen(false);
                  }}
                  className="w-full bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-700/60 text-emerald-300 font-semibold py-2 px-3 rounded-xl text-xs transition text-left flex items-center justify-between"
                >
                  <span>Mudar para OpenStreetMap (100% livre e sem chaves)</span>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                </button>
                <button
                  onClick={() => {
                    handleSelectStyle('esri-dark');
                    setIsKeyModalOpen(false);
                  }}
                  className="w-full bg-zinc-800/70 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 font-semibold py-2 px-3 rounded-xl text-xs transition text-left flex items-center justify-between"
                >
                  <span>Mudar para Esri Dark Canvas (Tema escuro sem chaves)</span>
                  <Check className="w-3.5 h-3.5 text-zinc-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect, useMemo } from 'react';
import { RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import {
  Podcast,
  PodcastSuggestion,
  FilterState,
  UserLocation,
  CRMStage,
} from './types';
import {
  getStoredPodcasts,
  savePodcasts,
  getStoredSuggestions,
  saveSuggestions,
  getAdminPin,
  setAdminPin,
  resetToSeedDataAndSyncPB,
  loadPodcastsWithPB,
  loadSuggestionsWithPB,
  saveSinglePodcast,
  deleteSinglePodcast,
  saveSingleSuggestion,
  deleteSingleSuggestion,
} from './services/storage';
import { savePodcastToPB, saveSuggestionToPB, seedPocketBaseDirectly } from './services/pocketbase';
import { calculateDistanceKm, KNOWN_CITY_COORDINATES, resolveGeocode } from './utils/geo';

// Components
import { Navbar } from './components/Navbar';
import { MapComponent } from './components/MapComponent';
import { PodcastList } from './components/PodcastList';
import { PodcastDetailModal } from './components/PodcastDetailModal';
import { SuggestPodcastModal } from './components/SuggestPodcastModal';
import { AdminAuthModal } from './components/Admin/AdminAuthModal';
import { CRMKanban } from './components/Admin/CRMKanban';
import { PodcastFormModal } from './components/Admin/PodcastFormModal';
import { SuggestionsInboxModal } from './components/Admin/SuggestionsInboxModal';
import { CRMStats } from './components/Admin/CRMStats';
import { PbCredentialsModal } from './components/Admin/PbCredentialsModal';

export default function App() {
  // Main Data States
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [suggestions, setSuggestions] = useState<PodcastSuggestion[]>([]);
  const [adminPin, setAdminPinState] = useState<string>('1234');

  // UI & Access Mode States
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<'map' | 'kanban'>('map');
  const [selectedPodcastId, setSelectedPodcastId] = useState<string | null>(null);
  // User Location State initialized with default location (São Paulo / Brazil center)
  const [userLocation, setUserLocation] = useState<UserLocation | null>({
    latitude: -23.5505,
    longitude: -46.6333,
    cityName: 'São Paulo',
    countryName: 'Brazil',
    isCustomOrDetected: false,
  });

  // Modals Visibility
  const [isAdminAuthOpen, setIsAdminAuthOpen] = useState<boolean>(false);
  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState<boolean>(false);
  const [isAddPodcastModalOpen, setIsAddPodcastModalOpen] = useState<boolean>(false);
  const [isSuggestionsInboxOpen, setIsSuggestionsInboxOpen] = useState<boolean>(false);
  const [isPbCredentialsModalOpen, setIsPbCredentialsModalOpen] = useState<boolean>(false);
  const [editingPodcast, setEditingPodcast] = useState<Podcast | null>(null);
  const [initialStageForAdd, setInitialStageForAdd] = useState<CRMStage>('notknow');
  const [pbSyncMessage, setPbSyncMessage] = useState<{ type: 'info' | 'success' | 'error'; text: string } | null>(null);
  const [isPbSeeded, setIsPbSeeded] = useState<boolean>(false);

  // Filter & Search State - default to 'distance' (Near Me)
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    entityType: 'all',
    studioType: '',
    niche: '',
    language: '',
    country: '',
    stage: '',
    sortBy: 'distance',
  });

  // Initial Load from Storage & PocketBase Sync & Request Geolocation
  useEffect(() => {
    const loadedPodcasts = getStoredPodcasts();
    const loadedSuggestions = getStoredSuggestions();
    const loadedPin = getAdminPin();

    setPodcasts(loadedPodcasts);
    setSuggestions(loadedSuggestions);
    setAdminPinState(loadedPin);

    // Sync with PocketBase self-hosted backend
    loadPodcastsWithPB().then(async ({ podcasts: pbPodcasts, isFromPB }) => {
      const rawList = isFromPB && pbPodcasts && pbPodcasts.length > 0 ? pbPodcasts : loadedPodcasts;
      
      // Auto-fix coordinates if any podcast has mismatched or Austin default coordinates for a non-Austin city (e.g. Itapetininga)
      let needsStateUpdate = false;
      const verifiedList = await Promise.all(
        rawList.map(async (p) => {
          const isAustinDefault = Math.abs(p.latitude - 30.2672) < 0.001 && Math.abs(p.longitude - (-97.7431)) < 0.001;
          const isZero = p.latitude === 0 && p.longitude === 0;

          if ((isAustinDefault || isZero) && p.city && p.city.toLowerCase() !== 'austin') {
            const resolved = await resolveGeocode(p.city, p.state, p.country);
            if (resolved.lat !== p.latitude || resolved.lng !== p.longitude) {
              needsStateUpdate = true;
              const updatedP = { ...p, latitude: resolved.lat, longitude: resolved.lng };
              savePodcastToPB(updatedP).catch(() => {});
              return updatedP;
            }
          }
          return p;
        })
      );

      setPodcasts(verifiedList);
      if (needsStateUpdate) {
        savePodcasts(verifiedList);
      }
      setIsPbSeeded(isFromPB && pbPodcasts.length > 0);
    });

    loadSuggestionsWithPB().then((pbSuggestions) => {
      if (pbSuggestions && pbSuggestions.length > 0) {
        setSuggestions(pbSuggestions);
      }
    });

    // Request Geolocation
    requestUserLocation();
  }, []);

  const requestUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            isCustomOrDetected: true,
          });
        },
        (err) => {
          console.log('Geolocation permission or error', err);
          // Fallback to Austin, USA or world view
          setUserLocation({
            latitude: 30.2672,
            longitude: -97.7431,
            cityName: 'Austin',
            countryName: 'USA',
            isCustomOrDetected: false,
          });
        },
        { timeout: 8000 }
      );
    }
  };

  // Synchronize Podcasts State to LocalStorage
  const handleUpdatePodcasts = (updated: Podcast[]) => {
    setPodcasts(updated);
    savePodcasts(updated);
  };

  // Synchronize Suggestions State to LocalStorage
  const handleUpdateSuggestions = (updated: PodcastSuggestion[]) => {
    setSuggestions(updated);
    saveSuggestions(updated);
  };

  // Update PIN
  const handleUpdatePin = (newPin: string) => {
    setAdminPinState(newPin);
    setAdminPin(newPin);
  };

  // Add / Edit Podcast
  const handleSavePodcast = (podcast: Podcast) => {
    saveSinglePodcast(podcast, podcasts).then((updated) => {
      setPodcasts(updated);
    });
  };

  // Change CRM Pipeline Stage
  const handleStageChange = (id: string, newStage: CRMStage) => {
    let targetPodcast: Podcast | null = null;
    const updated = podcasts.map((p) => {
      if (p.id === id) {
        const newNotes = p.notes || [];
        const noteText = `Stage updated to: ${newStage.toUpperCase()}`;
        const updatedItem = {
          ...p,
          stage: newStage,
          updatedAt: new Date().toISOString(),
          notes: [
            {
              id: `n-${Date.now()}`,
              date: new Date().toISOString().split('T')[0],
              author: 'Admin',
              text: noteText,
            },
            ...newNotes,
          ],
        };
        targetPodcast = updatedItem;
        return updatedItem;
      }
      return p;
    });
    handleUpdatePodcasts(updated);
    if (targetPodcast) {
      savePodcastToPB(targetPodcast);
    }
  };

  // Add Note to Podcast
  const handleAddNote = (podcastId: string, text: string) => {
    let targetPodcast: Podcast | null = null;
    const updated = podcasts.map((p) => {
      if (p.id === podcastId) {
        const existingNotes = p.notes || [];
        const updatedItem = {
          ...p,
          notes: [
            {
              id: `note-${Date.now()}`,
              date: new Date().toISOString().split('T')[0],
              author: 'Admin',
              text,
            },
            ...existingNotes,
          ],
        };
        targetPodcast = updatedItem;
        return updatedItem;
      }
      return p;
    });
    handleUpdatePodcasts(updated);
    if (targetPodcast) {
      savePodcastToPB(targetPodcast);
    }
  };

  // Delete Note
  const handleDeleteNote = (podcastId: string, noteId: string) => {
    let targetPodcast: Podcast | null = null;
    const updated = podcasts.map((p) => {
      if (p.id === podcastId) {
        const updatedItem = {
          ...p,
          notes: (p.notes || []).filter((n) => n.id !== noteId),
        };
        targetPodcast = updatedItem;
        return updatedItem;
      }
      return p;
    });
    handleUpdatePodcasts(updated);
    if (targetPodcast) {
      savePodcastToPB(targetPodcast);
    }
  };

  // Delete Podcast
  const handleDeletePodcast = (id: string) => {
    deleteSinglePodcast(id, podcasts).then((updated) => {
      setPodcasts(updated);
    });
    if (selectedPodcastId === id) setSelectedPodcastId(null);
  };

  // Public Suggestion Submission
  const handleSubmitSuggestion = (
    suggestionData: Omit<PodcastSuggestion, 'id' | 'createdAt' | 'status'>
  ) => {
    const newSug: PodcastSuggestion = {
      ...suggestionData,
      id: `sug-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    saveSingleSuggestion(newSug, suggestions).then((updated) => {
      setSuggestions(updated);
    });
  };


  // Approve Suggestion
  const handleApproveSuggestion = async (suggestion: PodcastSuggestion) => {
    // Open Add Podcast form pre-populated with suggestion data and REAL geocode!
    const cityCoord = await resolveGeocode(suggestion.city, suggestion.state, suggestion.country);
    
    setEditingPodcast({
      id: `pod-${Date.now()}`,
      name: suggestion.podcastName,
      description: suggestion.submitterNote || 'User suggested podcast',
      youtubeUrl: suggestion.youtubeUrl,
      instagramUrl: suggestion.instagramUrl,
      tiktokUrl: suggestion.tiktokUrl,
      studioId: suggestion.studioId,
      studioName: suggestion.studioName,
      coverImage: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400&auto=format&fit=crop&q=80',
      country: suggestion.country,
      state: suggestion.state,
      city: suggestion.city,
      latitude: cityCoord.lat,
      longitude: cityCoord.lng,
      language: suggestion.language,
      niche: suggestion.niche,
      stage: 'notknow',
      hosts: suggestion.hosts || [],
      producers: suggestion.producers || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      suggestedBy: suggestion.submittedByEmail || 'Public User',
    });

    // Mark suggestion as approved
    let approvedSugItem: PodcastSuggestion | null = null;
    const updatedSug = suggestions.map((s) => {
      if (s.id === suggestion.id) {
        const item = { ...s, status: 'approved' as const };
        approvedSugItem = item;
        return item;
      }
      return s;
    });
    handleUpdateSuggestions(updatedSug);
    if (approvedSugItem) saveSuggestionToPB(approvedSugItem);
    setIsSuggestionsInboxOpen(false);
    setIsAddPodcastModalOpen(true);
  };

  // Reject Suggestion
  const handleRejectSuggestion = (id: string) => {
    let rejectedSugItem: PodcastSuggestion | null = null;
    const updatedSug = suggestions.map((s) => {
      if (s.id === id) {
        const item = { ...s, status: 'rejected' as const };
        rejectedSugItem = item;
        return item;
      }
      return s;
    });
    handleUpdateSuggestions(updatedSug);
    if (rejectedSugItem) saveSuggestionToPB(rejectedSugItem);
  };

  // Reset Data to Initial Seed & Sync to PocketBase
  const handleResetData = async () => {
    setPbSyncMessage({ type: 'info', text: 'Connecting to PocketBase (pocket.f5sites.com.br) and seeding database...' });
    
    const { podcasts: seedP, suggestions: seedS, pbResult } = await resetToSeedDataAndSyncPB();
    setPodcasts(seedP);
    setSuggestions(seedS);
    setSelectedPodcastId(null);

    if (pbResult.success) {
      setIsPbSeeded(true);
      setPbSyncMessage({
        type: 'success',
        text: pbResult.message,
      });
    } else {
      setPbSyncMessage({
        type: 'error',
        text: pbResult.message,
      });
    }
    setTimeout(() => setPbSyncMessage(null), 10000);
  };

  // Filter & Sort Computation
  const filteredPodcasts = useMemo(() => {
    return podcasts
      .filter((p) => {
        // Entity Type Filter ('all' | 'podcast' | 'studio')
        if (filters.entityType === 'podcast' && p.entityType === 'studio') return false;
        if (filters.entityType === 'studio' && p.entityType !== 'studio') return false;

        // Studio Type Filter
        if (filters.studioType && p.studioType !== filters.studioType) return false;

        // Search Query Match
        if (filters.searchQuery.trim()) {
          const q = filters.searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchDesc = (p.description || '').toLowerCase().includes(q);
          const matchNiche = (p.niche || '').toLowerCase().includes(q);
          const matchCity = (p.city || '').toLowerCase().includes(q);
          const matchCountry = (p.country || '').toLowerCase().includes(q);
          const matchHost = p.hosts?.some((h) => h.name.toLowerCase().includes(q));
          const matchProducer = p.producers?.some((prod) => prod.name.toLowerCase().includes(q));
          const matchEquip = p.studioEquipment?.some((eq) => eq.toLowerCase().includes(q));
          const matchService = p.studioServices?.some((srv) => srv.toLowerCase().includes(q));

          if (
            !matchName &&
            !matchDesc &&
            !matchNiche &&
            !matchCity &&
            !matchCountry &&
            !matchHost &&
            !matchProducer &&
            !matchEquip &&
            !matchService
          ) {
            return false;
          }
        }

        // Niche Filter
        if (filters.niche && p.niche !== filters.niche) return false;

        // Language Filter
        if (filters.language && p.language !== filters.language) return false;

        // Country Filter
        if (filters.country && p.country !== filters.country) return false;

        // Stage Filter (Admin)
        if (filters.stage && p.stage !== filters.stage) return false;

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'distance' && userLocation) {
          const distA = calculateDistanceKm(userLocation.latitude, userLocation.longitude, a.latitude, a.longitude);
          const distB = calculateDistanceKm(userLocation.latitude, userLocation.longitude, b.latitude, b.longitude);
          return distA - distB;
        }
        if (filters.sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        if (filters.sortBy === 'rating') {
          return (b.rating || 0) - (a.rating || 0);
        }
        // newest default
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [podcasts, filters, userLocation]);

  const selectedPodcast = podcasts.find((p) => p.id === selectedPodcastId) || null;
  const pendingSuggestionsCount = suggestions.filter((s) => s.status === 'pending').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-purple-500 selection:text-white flex flex-col">
      
      {/* Top Navbar */}
      <Navbar
        isAdmin={isAdmin}
        onToggleAdminModal={() => {
          if (isAdmin) {
            setIsAdmin(false); // Exit admin mode
          } else {
            setIsAdminAuthOpen(true);
          }
        }}
        onOpenSuggestModal={() => setIsSuggestModalOpen(true)}
        onOpenAddPodcastModal={() => {
          setEditingPodcast(null);
          setInitialStageForAdd('notknow');
          setIsAddPodcastModalOpen(true);
        }}
        onOpenSuggestionsInbox={() => setIsSuggestionsInboxOpen(true)}
        pendingSuggestionsCount={pendingSuggestionsCount}
        currentView={currentView}
        onViewChange={(v) => setCurrentView(v)}
        searchQuery={filters.searchQuery}
        onSearchChange={(q) => setFilters((prev) => ({ ...prev, searchQuery: q }))}
        onResetData={handleResetData}
        isPbSeeded={isPbSeeded}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* PocketBase Sync / Seed Status Toast Banner */}
        {pbSyncMessage && (
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between gap-3 shadow-xl transition animate-in fade-in ${
              pbSyncMessage.type === 'info'
                ? 'bg-amber-950/80 border-yellow-500/50 text-yellow-200'
                : pbSyncMessage.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/60 text-emerald-100'
                : 'bg-rose-950/90 border-rose-500/60 text-rose-100'
            }`}
          >
            <div className="flex items-center gap-3">
              {pbSyncMessage.type === 'info' ? (
                <RefreshCw className="w-5 h-5 animate-spin text-yellow-400 shrink-0" />
              ) : pbSyncMessage.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              )}
              <div className="text-xs sm:text-sm font-semibold">{pbSyncMessage.text}</div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {pbSyncMessage.type === 'error' && (
                <button
                  onClick={() => setIsPbCredentialsModalOpen(true)}
                  className="px-3 py-1 rounded-lg bg-yellow-400 text-black font-extrabold text-xs hover:bg-yellow-300 transition shadow"
                >
                  Configurar Credenciais PB
                </button>
              )}
              <button
                onClick={() => setPbSyncMessage(null)}
                className="p-1.5 hover:bg-white/10 rounded-lg text-xs opacity-80 hover:opacity-100 font-bold"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Admin CRM Metrics Dashboard (If Admin Mode Active) */}
        {isAdmin && <CRMStats podcasts={podcasts} />}

        {/* View mode 1: Map & List View */}
        {currentView === 'map' ? (
          <div className="space-y-6">
            
            {/* World Map Component */}
            <MapComponent
              podcasts={filteredPodcasts}
              selectedPodcastId={selectedPodcastId}
              onSelectPodcast={(id) => setSelectedPodcastId(id)}
              userLocation={userLocation}
              onRequestUserLocation={requestUserLocation}
              isAdmin={isAdmin}
            />

            {/* Podcast Directory List Below Map */}
            <PodcastList
              podcasts={filteredPodcasts}
              allPodcasts={podcasts}
              selectedPodcastId={selectedPodcastId}
              onSelectPodcast={(id) => setSelectedPodcastId(id)}
              filters={filters}
              onFilterChange={(updated) => setFilters((prev) => ({ ...prev, ...updated }))}
              onResetFilters={() =>
                setFilters({
                  searchQuery: '',
                  entityType: 'all',
                  studioType: '',
                  niche: '',
                  language: '',
                  country: '',
                  stage: '',
                  sortBy: 'distance',
                })
              }
              userLocation={userLocation}
              isAdmin={isAdmin}
              onStageChange={handleStageChange}
            />

          </div>
        ) : (
          /* View mode 2: Secret Admin CRM Kanban Pipeline */
          <CRMKanban
            podcasts={filteredPodcasts}
            onSelectPodcast={(id) => setSelectedPodcastId(id)}
            onStageChange={handleStageChange}
            onOpenAddModalWithStage={(stage) => {
              setEditingPodcast(null);
              setInitialStageForAdd(stage);
              setIsAddPodcastModalOpen(true);
            }}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">PodMap CRM</span>
            <span>— Global Podcast Discovery & Secret Pipeline</span>
          </div>
          <div className="text-slate-600">
            {podcasts.length} podcasts indexed across {new Set(podcasts.map((p) => p.country)).size} countries
          </div>
        </div>
      </footer>

      {/* --- ALL MODALS & DIALOGS --- */}

      {/* Podcast Detail Drawer / Modal */}
      <PodcastDetailModal
        podcast={selectedPodcast}
        onClose={() => setSelectedPodcastId(null)}
        isAdmin={isAdmin}
        onStageChange={handleStageChange}
        onAddNote={handleAddNote}
        onDeleteNote={handleDeleteNote}
        onEditPodcast={(pod) => {
          setEditingPodcast(pod);
          setIsAddPodcastModalOpen(true);
        }}
        onDeletePodcast={handleDeletePodcast}
      />

      {/* Public Suggest Podcast Modal */}
      <SuggestPodcastModal
        isOpen={isSuggestModalOpen}
        onClose={() => setIsSuggestModalOpen(false)}
        onSubmitSuggestion={handleSubmitSuggestion}
        existingStudios={podcasts.filter((p) => p.entityType === 'studio')}
        allPodcasts={podcasts}
      />

      {/* Admin Authentication PIN Modal */}
      <AdminAuthModal
        isOpen={isAdminAuthOpen}
        onClose={() => setIsAdminAuthOpen(false)}
        onSuccessLogin={() => setIsAdmin(true)}
        currentPin={adminPin}
        onChangePin={handleUpdatePin}
      />

      {/* Insert / Edit Podcast Form Modal */}
      <PodcastFormModal
        isOpen={isAddPodcastModalOpen}
        onClose={() => setIsAddPodcastModalOpen(false)}
        onSave={handleSavePodcast}
        editingPodcast={editingPodcast}
        initialStage={initialStageForAdd}
        existingStudios={podcasts.filter((p) => p.entityType === 'studio')}
        allPodcasts={podcasts}
      />

      {/* Admin Suggestions Inbox Modal */}
      <SuggestionsInboxModal
        isOpen={isSuggestionsInboxOpen}
        onClose={() => setIsSuggestionsInboxOpen(false)}
        suggestions={suggestions}
        onApprove={handleApproveSuggestion}
        onReject={handleRejectSuggestion}
      />

      {/* PocketBase Credentials Config Modal */}
      <PbCredentialsModal
        isOpen={isPbCredentialsModalOpen}
        onClose={() => setIsPbCredentialsModalOpen(false)}
        onSaved={handleResetData}
      />

    </div>
  );
}

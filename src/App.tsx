import React, { useState, useEffect, useMemo } from 'react';
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
  resetToSeedData,
} from './services/storage';
import { calculateDistanceKm, KNOWN_CITY_COORDINATES } from './utils/geo';

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

export default function App() {
  // Main Data States
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [suggestions, setSuggestions] = useState<PodcastSuggestion[]>([]);
  const [adminPin, setAdminPinState] = useState<string>('1234');

  // UI & Access Mode States
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<'map' | 'kanban'>('map');
  const [selectedPodcastId, setSelectedPodcastId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);

  // Modals Visibility
  const [isAdminAuthOpen, setIsAdminAuthOpen] = useState<boolean>(false);
  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState<boolean>(false);
  const [isAddPodcastModalOpen, setIsAddPodcastModalOpen] = useState<boolean>(false);
  const [isSuggestionsInboxOpen, setIsSuggestionsInboxOpen] = useState<boolean>(false);
  const [editingPodcast, setEditingPodcast] = useState<Podcast | null>(null);
  const [initialStageForAdd, setInitialStageForAdd] = useState<CRMStage>('notknow');

  // Filter & Search State
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    niche: '',
    language: '',
    country: '',
    stage: '',
    sortBy: 'newest',
  });

  // Initial Load from Storage & Request Geolocation
  useEffect(() => {
    const loadedPodcasts = getStoredPodcasts();
    const loadedSuggestions = getStoredSuggestions();
    const loadedPin = getAdminPin();

    setPodcasts(loadedPodcasts);
    setSuggestions(loadedSuggestions);
    setAdminPinState(loadedPin);

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
    const exists = podcasts.some((p) => p.id === podcast.id);
    let updated: Podcast[];
    if (exists) {
      updated = podcasts.map((p) => (p.id === podcast.id ? podcast : p));
    } else {
      updated = [podcast, ...podcasts];
    }
    handleUpdatePodcasts(updated);
  };

  // Change CRM Pipeline Stage
  const handleStageChange = (id: string, newStage: CRMStage) => {
    const updated = podcasts.map((p) => {
      if (p.id === id) {
        const newNotes = p.notes || [];
        const noteText = `Stage updated to: ${newStage.toUpperCase()}`;
        return {
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
      }
      return p;
    });
    handleUpdatePodcasts(updated);
  };

  // Add Note to Podcast
  const handleAddNote = (podcastId: string, text: string) => {
    const updated = podcasts.map((p) => {
      if (p.id === podcastId) {
        const existingNotes = p.notes || [];
        return {
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
      }
      return p;
    });
    handleUpdatePodcasts(updated);
  };

  // Delete Note
  const handleDeleteNote = (podcastId: string, noteId: string) => {
    const updated = podcasts.map((p) => {
      if (p.id === podcastId) {
        return {
          ...p,
          notes: (p.notes || []).filter((n) => n.id !== noteId),
        };
      }
      return p;
    });
    handleUpdatePodcasts(updated);
  };

  // Delete Podcast
  const handleDeletePodcast = (id: string) => {
    const updated = podcasts.filter((p) => p.id !== id);
    handleUpdatePodcasts(updated);
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
    handleUpdateSuggestions([newSug, ...suggestions]);
  };

  // Approve Suggestion
  const handleApproveSuggestion = (suggestion: PodcastSuggestion) => {
    // Open Add Podcast form pre-populated with suggestion data!
    const cityCoord = KNOWN_CITY_COORDINATES[suggestion.city] || { lat: 30.2672, lng: -97.7431 };
    
    setEditingPodcast({
      id: `pod-${Date.now()}`,
      name: suggestion.podcastName,
      description: suggestion.submitterNote || 'User suggested podcast',
      youtubeUrl: suggestion.youtubeUrl,
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
    const updatedSug = suggestions.map((s) =>
      s.id === suggestion.id ? { ...s, status: 'approved' as const } : s
    );
    handleUpdateSuggestions(updatedSug);
    setIsSuggestionsInboxOpen(false);
    setIsAddPodcastModalOpen(true);
  };

  // Reject Suggestion
  const handleRejectSuggestion = (id: string) => {
    const updatedSug = suggestions.map((s) =>
      s.id === id ? { ...s, status: 'rejected' as const } : s
    );
    handleUpdateSuggestions(updatedSug);
  };

  // Reset Data to Initial Seed
  const handleResetData = () => {
    if (confirm('Are you sure you want to reset all podcasts and CRM data to initial seed?')) {
      const { podcasts: seedP, suggestions: seedS } = resetToSeedData();
      setPodcasts(seedP);
      setSuggestions(seedS);
      setSelectedPodcastId(null);
    }
  };

  // Filter & Sort Computation
  const filteredPodcasts = useMemo(() => {
    return podcasts
      .filter((p) => {
        // Search Query Match
        if (filters.searchQuery.trim()) {
          const q = filters.searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchNiche = p.niche.toLowerCase().includes(q);
          const matchCity = p.city.toLowerCase().includes(q);
          const matchCountry = p.country.toLowerCase().includes(q);
          const matchHost = p.hosts?.some((h) => h.name.toLowerCase().includes(q));
          const matchProducer = p.producers?.some((prod) => prod.name.toLowerCase().includes(q));
          if (!matchName && !matchNiche && !matchCity && !matchCountry && !matchHost && !matchProducer) {
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
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
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
                  niche: '',
                  language: '',
                  country: '',
                  stage: '',
                  sortBy: 'newest',
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
      />

      {/* Admin Suggestions Inbox Modal */}
      <SuggestionsInboxModal
        isOpen={isSuggestionsInboxOpen}
        onClose={() => setIsSuggestionsInboxOpen(false)}
        suggestions={suggestions}
        onApprove={handleApproveSuggestion}
        onReject={handleRejectSuggestion}
      />

    </div>
  );
}

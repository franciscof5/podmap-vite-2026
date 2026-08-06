import React from 'react';
import {
  Mic,
  MapPin,
  Kanban,
  PlusCircle,
  Inbox,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  isAdmin: boolean;
  onOpenSuggestModal: () => void;
  onOpenAddPodcastModal: () => void;
  onOpenSuggestionsInbox: () => void;
  pendingSuggestionsCount: number;
  currentView: 'map' | 'kanban';
  onViewChange: (view: 'map' | 'kanban') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isAdmin,
  onOpenSuggestModal,
  onOpenAddPodcastModal,
  onOpenSuggestionsInbox,
  pendingSuggestionsCount,
  currentView,
  onViewChange,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0e0e11]/95 backdrop-blur-md border-b border-zinc-800/80 text-zinc-100 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Logo & Branding */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-yellow-400 via-amber-400 to-yellow-500 flex items-center justify-center text-black shadow-lg shadow-yellow-500/20 border border-yellow-300/40 shrink-0">
              <Mic className="w-5 h-5 fill-black stroke-black" />
            </div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1">
                Pod<span className="text-yellow-400 font-extrabold">Map</span>
              </h1>
              {isAdmin && (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-yellow-400 text-black shadow animate-pulse">
                  ADMIN CRM MODE
                </span>
              )}
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-2">
            
            {/* View switcher (If Admin) */}
            {isAdmin && (
              <div className="bg-[#18181c] p-1 rounded-xl border border-zinc-800 flex items-center text-xs font-semibold">
                <button
                  onClick={() => onViewChange('map')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition ${
                    currentView === 'map'
                      ? 'bg-yellow-400 text-black font-extrabold shadow'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                  title="World Map & Directory"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Map & Directory</span>
                </button>
                <button
                  onClick={() => onViewChange('kanban')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition ${
                    currentView === 'kanban'
                      ? 'bg-yellow-400 text-black font-extrabold shadow'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                  title="CRM Kanban Pipeline"
                >
                  <Kanban className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">CRM Kanban</span>
                </button>
              </div>
            )}

            {/* Admin Actions */}
            {isAdmin ? (
              <>
                <button
                  onClick={onOpenSuggestionsInbox}
                  className="relative p-2 rounded-xl bg-[#18181c] hover:bg-zinc-800 border border-zinc-700/80 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition"
                  title="Review Suggestions"
                >
                  <Inbox className="w-4 h-4 text-yellow-400" />
                  <span className="hidden lg:inline">Inbox</span>
                  {pendingSuggestionsCount > 0 && (
                    <span className="bg-yellow-400 text-black font-extrabold px-1.5 py-0.2 text-[10px] rounded-full">
                      {pendingSuggestionsCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={onOpenAddPodcastModal}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:to-amber-400 text-black text-xs font-extrabold flex items-center gap-1.5 shadow-lg shadow-yellow-500/20 transition active:scale-95"
                >
                  <PlusCircle className="w-4 h-4 fill-black stroke-yellow-400" />
                  <span>Insert CRM Entry</span>
                </button>
              </>
            ) : (
              /* Public PodCut Style Button */
              <button
                onClick={onOpenSuggestModal}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:to-amber-400 text-black text-xs font-extrabold flex items-center gap-1.5 shadow-lg shadow-yellow-500/20 transition active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 fill-black" />
                <span>Suggest Podcast</span>
              </button>
            )}

          </div>
        </div>
      </div>
    </header>
  );
};

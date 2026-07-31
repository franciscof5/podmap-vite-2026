import React from 'react';
import {
  Mic,
  MapPin,
  Kanban,
  PlusCircle,
  Inbox,
  Lock,
  Unlock,
  Sparkles,
  Search,
  RotateCcw
} from 'lucide-react';

interface NavbarProps {
  isAdmin: boolean;
  onToggleAdminModal: () => void;
  onOpenSuggestModal: () => void;
  onOpenAddPodcastModal: () => void;
  onOpenSuggestionsInbox: () => void;
  pendingSuggestionsCount: number;
  currentView: 'map' | 'kanban';
  onViewChange: (view: 'map' | 'kanban') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onResetData?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isAdmin,
  onToggleAdminModal,
  onOpenSuggestModal,
  onOpenAddPodcastModal,
  onOpenSuggestionsInbox,
  pendingSuggestionsCount,
  currentView,
  onViewChange,
  searchQuery,
  onSearchChange,
  onResetData,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800 text-slate-100 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 via-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
                  PodMap
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-purple-400 border border-purple-500/30">
                    CRM
                  </span>
                </h1>
                {isAdmin && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse">
                    SECRET ADMIN MODE
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Global Podcast Directory & Pipeline
              </p>
            </div>
          </div>

          {/* Quick Search */}
          <div className="flex-1 max-w-md mx-2 hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search podcast name, host, city, niche..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-slate-800/90 border border-slate-700/80 rounded-lg pl-9 pr-3 py-1.5 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
              />
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-2">
            
            {/* View switcher (If Admin) */}
            {isAdmin && (
              <div className="bg-slate-800 p-1 rounded-lg border border-slate-700/80 flex items-center text-xs font-medium">
                <button
                  onClick={() => onViewChange('map')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition ${
                    currentView === 'map'
                      ? 'bg-purple-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="World Map & List View"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Map & List</span>
                </button>
                <button
                  onClick={() => onViewChange('kanban')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition ${
                    currentView === 'kanban'
                      ? 'bg-purple-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="CRM Kanban Board"
                >
                  <Kanban className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Kanban CRM</span>
                </button>
              </div>
            )}

            {/* Admin Specific Actions */}
            {isAdmin ? (
              <>
                <button
                  onClick={onOpenSuggestionsInbox}
                  className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition"
                  title="Review User Suggestions"
                >
                  <Inbox className="w-4 h-4 text-amber-400" />
                  <span className="hidden lg:inline">Suggestions</span>
                  {pendingSuggestionsCount > 0 && (
                    <span className="bg-amber-500 text-slate-950 font-bold px-1.5 py-0.2 text-[10px] rounded-full">
                      {pendingSuggestionsCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={onOpenAddPodcastModal}
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-purple-900/30 transition"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Insert Podcast</span>
                </button>
              </>
            ) : (
              /* Public User Action */
              <button
                onClick={onOpenSuggestModal}
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600/90 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition border border-indigo-400/30"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Suggest Podcast</span>
              </button>
            )}

            {/* Admin Secret Lock Toggle */}
            <button
              onClick={onToggleAdminModal}
              className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition ${
                isAdmin
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
              title={isAdmin ? 'Secret Admin Active (Click to Exit)' : 'Secret CRM Login'}
            >
              {isAdmin ? (
                <>
                  <Unlock className="w-4 h-4 text-emerald-400" />
                  <span className="hidden xl:inline text-xs">Admin Mode</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-slate-400" />
                  <span className="hidden sm:inline text-xs">Secret CRM</span>
                </>
              )}
            </button>

            {/* Reset Seed Data (Admin Only) */}
            {isAdmin && onResetData && (
              <button
                onClick={onResetData}
                className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition"
                title="Reset to Initial Seed Data"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}

          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="pb-3 md:hidden">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search podcast, host, city, niche..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

      </div>
    </header>
  );
};

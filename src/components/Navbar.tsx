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
  RotateCcw,
  Database
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
  isPbSeeded?: boolean;
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
  isPbSeeded = false,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0e0e11]/95 backdrop-blur-md border-b border-zinc-800/80 text-zinc-100 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Logo & PodCut Branding */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-yellow-400 via-amber-400 to-yellow-500 flex items-center justify-center text-black shadow-lg shadow-yellow-500/20 border border-yellow-300/40 shrink-0">
              <Mic className="w-5 h-5 fill-black stroke-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1">
                  Pod<span className="text-yellow-400 font-extrabold">Map</span>
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-yellow-400/10 text-yellow-400 border border-yellow-500/30 uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 text-yellow-400" />
                  AI Directory
                </span>
                {isPbSeeded ? (
                  <span
                    className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 flex items-center gap-1.5 shadow-sm"
                    title="PocketBase Database Online & Synced (pocket.f5sites.com.br)"
                  >
                    <Database className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="hidden sm:inline">PB Synced</span>
                  </span>
                ) : isAdmin ? (
                  <button
                    onClick={onResetData}
                    className="text-[10px] font-extrabold px-2.5 py-1 rounded-lg bg-yellow-400 text-black hover:bg-yellow-300 border border-yellow-300 flex items-center gap-1.5 transition active:scale-95 shadow-md shadow-yellow-500/20"
                    title="Seed database into PocketBase (pocket.f5sites.com.br)"
                  >
                    <Database className="w-3.5 h-3.5 fill-black stroke-black" />
                    <span>Seed PocketBase</span>
                  </button>
                ) : null}
                {isAdmin && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-yellow-400 text-black shadow animate-pulse">
                    ADMIN CRM MODE
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-400 hidden sm:block">
                Global Podcast Directory & Studio Map • PodCut Edition
              </p>
            </div>
          </div>

          {/* Quick Search */}
          <div className="flex-1 max-w-md mx-2 hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search podcasts, studios, equipment, city..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-[#16161a] border border-zinc-800 rounded-xl pl-10 pr-3 py-1.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/60 focus:border-yellow-400 transition"
              />
            </div>
          </div>

          {/* Action Controls in PodCut Style */}
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

            {/* Admin Secret Lock Toggle */}
            <button
              onClick={onToggleAdminModal}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition ${
                isAdmin
                  ? 'bg-amber-950/40 border-yellow-500/60 text-yellow-300 hover:bg-amber-900/60'
                  : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-yellow-500/50 hover:text-white'
              }`}
              title={isAdmin ? 'Exit Admin Mode' : 'Secret CRM Login'}
            >
              {isAdmin ? (
                <>
                  <Unlock className="w-4 h-4 text-yellow-400" />
                  <span className="hidden xl:inline">Exit Admin</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-zinc-400" />
                  <span className="hidden sm:inline">CRM Login</span>
                </>
              )}
            </button>

            {/* Reset Seed Data */}
            {isAdmin && onResetData && (
              <button
                onClick={onResetData}
                className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-yellow-400 border border-zinc-700 transition"
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
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search podcasts, studios, equipment..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-[#16161a] border border-zinc-800 rounded-xl pl-10 pr-3 py-1.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
        </div>

      </div>
    </header>
  );
};

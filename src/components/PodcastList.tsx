import React from 'react';
import { Podcast, FilterState, UserLocation } from '../types';
import { PodcastCard } from './PodcastCard';
import { Filter, SlidersHorizontal, RotateCcw, Podcast as PodcastIcon } from 'lucide-react';

interface PodcastListProps {
  podcasts: Podcast[];
  allPodcasts: Podcast[];
  selectedPodcastId: string | null;
  onSelectPodcast: (id: string) => void;
  filters: FilterState;
  onFilterChange: (updated: Partial<FilterState>) => void;
  onResetFilters: () => void;
  userLocation: UserLocation | null;
  isAdmin: boolean;
  onStageChange?: (id: string, stage: any) => void;
}

export const PodcastList: React.FC<PodcastListProps> = ({
  podcasts,
  allPodcasts,
  selectedPodcastId,
  onSelectPodcast,
  filters,
  onFilterChange,
  onResetFilters,
  userLocation,
  isAdmin,
  onStageChange,
}) => {
  // Extract unique niches, languages, countries for dropdown options
  const niches = Array.from(new Set(allPodcasts.map((p) => p.niche).filter(Boolean))).sort();
  const languages = Array.from(new Set(allPodcasts.map((p) => p.language).filter(Boolean))).sort();
  const countries = Array.from(new Set(allPodcasts.map((p) => p.country).filter(Boolean))).sort();

  const isFilterActive =
    filters.searchQuery ||
    filters.niche ||
    filters.language ||
    filters.country ||
    filters.stage;

  return (
    <div className="space-y-4">
      {/* Filters Bar Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
        <div className="flex items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-purple-950/80 border border-purple-800/40 text-purple-400">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                Podcast Directory & Filters
                <span className="text-xs bg-slate-800 text-purple-300 px-2 py-0.5 rounded-full font-medium">
                  {podcasts.length} found
                </span>
              </h2>
              <p className="text-xs text-slate-400">Filter by niche, location, or CRM pipeline status</p>
            </div>
          </div>

          {/* Reset Filters */}
          {isFilterActive && (
            <button
              onClick={onResetFilters}
              className="text-xs font-medium text-rose-400 hover:text-rose-300 flex items-center gap-1 bg-rose-950/40 hover:bg-rose-950/80 px-2.5 py-1 rounded-lg border border-rose-800/40 transition"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear Filters</span>
            </button>
          )}
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {/* Niche Dropdown */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Niche / Category
            </label>
            <select
              value={filters.niche}
              onChange={(e) => onFilterChange({ niche: e.target.value })}
              className="w-full bg-slate-800/90 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Niches</option>
              {niches.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          {/* Language Dropdown */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Language
            </label>
            <select
              value={filters.language}
              onChange={(e) => onFilterChange({ language: e.target.value })}
              className="w-full bg-slate-800/90 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Languages</option>
              {languages.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          {/* Country Dropdown */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Country
            </label>
            <select
              value={filters.country}
              onChange={(e) => onFilterChange({ country: e.target.value })}
              className="w-full bg-slate-800/90 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Countries</option>
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* CRM Stage (Admin only) */}
          {isAdmin ? (
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-amber-400 mb-1">
                CRM Stage
              </label>
              <select
                value={filters.stage}
                onChange={(e) => onFilterChange({ stage: e.target.value })}
                className="w-full bg-amber-950/30 border border-amber-800/50 rounded-lg px-2.5 py-1.5 text-xs text-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">All Stages</option>
                <option value="notknow">Not Known</option>
                <option value="viewed">Viewed / Researched</option>
                <option value="contacted">Contacted</option>
                <option value="lead">Lead / Warm</option>
                <option value="partner">Partner</option>
                <option value="customer">Customer</option>
                <option value="ex-customer">Ex-Customer</option>
              </select>
            </div>
          ) : (
            <div className="hidden lg:block"></div>
          )}

          {/* Sort By Dropdown */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Sort By
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => onFilterChange({ sortBy: e.target.value as any })}
              className="w-full bg-slate-800/90 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="distance" disabled={!userLocation}>
                Nearest to Me {!userLocation ? '(Enable Location)' : ''}
              </option>
              <option value="name">Name (A-Z)</option>
              <option value="rating">Rating (Highest)</option>
              <option value="newest">Recently Added</option>
            </select>
          </div>
        </div>
      </div>

      {/* Podcast Grid */}
      {podcasts.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          <PodcastIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="font-bold text-slate-200 text-base mb-1">No podcasts match your filters</h3>
          <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
            Try adjusting your search query, location, or category filters to view more podcasts.
          </p>
          <button
            onClick={onResetFilters}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-xl shadow transition"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {podcasts.map((podcast) => (
            <PodcastCard
              key={podcast.id}
              podcast={podcast}
              isSelected={podcast.id === selectedPodcastId}
              onSelect={onSelectPodcast}
              userLocation={userLocation}
              isAdmin={isAdmin}
              onStageChange={onStageChange}
            />
          ))}
        </div>
      )}
    </div>
  );
};

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
    filters.entityType !== 'all' ||
    filters.studioType ||
    filters.niche ||
    filters.language ||
    filters.country ||
    filters.stage;

  return (
    <div className="space-y-4">
      {/* Filters Bar Header */}
      <div className="bg-[#141417] border border-zinc-800/80 rounded-2xl p-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3 pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-yellow-400/10 border border-yellow-500/30 text-yellow-400">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-zinc-100 flex items-center gap-2">
                Directory & Filters
                <span className="text-xs bg-yellow-400/10 border border-yellow-500/30 text-yellow-400 px-2.5 py-0.5 rounded-full font-bold">
                  {podcasts.length} items
                </span>
              </h2>
              <p className="text-xs text-zinc-400">Explore global podcasts & recording studio facilities</p>
            </div>
          </div>

          {/* Entity Type Selector (All vs Podcasts vs Studios) */}
          <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-zinc-800 shrink-0">
            <button
              onClick={() => onFilterChange({ entityType: 'all', studioType: '' })}
              className={`px-3 py-1 rounded-lg text-xs font-extrabold transition ${
                filters.entityType === 'all'
                  ? 'bg-yellow-400 text-black shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              All Items ({allPodcasts.length})
            </button>
            <button
              onClick={() => onFilterChange({ entityType: 'podcast' })}
              className={`px-3 py-1 rounded-lg text-xs font-extrabold transition ${
                filters.entityType === 'podcast'
                  ? 'bg-yellow-400 text-black shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Podcasts ({allPodcasts.filter((p) => p.entityType !== 'studio').length})
            </button>
            <button
              onClick={() => onFilterChange({ entityType: 'studio' })}
              className={`px-3 py-1 rounded-lg text-xs font-extrabold transition ${
                filters.entityType === 'studio'
                  ? 'bg-yellow-400 text-black shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Studios ({allPodcasts.filter((p) => p.entityType === 'studio').length})
            </button>
          </div>

          {/* Reset Filters */}
          {isFilterActive && (
            <button
              onClick={onResetFilters}
              className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 bg-rose-950/40 hover:bg-rose-950/80 px-2.5 py-1 rounded-xl border border-rose-800/40 transition shrink-0"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {/* Studio Type Dropdown */}
          {(filters.entityType === 'studio' || filters.entityType === 'all') && (
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-yellow-400 mb-1">
                Studio Type
              </label>
              <select
                value={filters.studioType}
                onChange={(e) => onFilterChange({ studioType: e.target.value })}
                className="w-full bg-[#1a1a1e] border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="">All Studio Types</option>
                <option value="podcast">Podcast Studio</option>
                <option value="tv">TV / Broadcast Studio</option>
                <option value="radio">Radio Studio</option>
                <option value="hybrid">Hybrid (Podcast + TV)</option>
                <option value="production_house">Production House</option>
              </select>
            </div>
          )}

          {/* Niche Dropdown */}
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 mb-1">
              Niche / Category
            </label>
            <select
              value={filters.niche}
              onChange={(e) => onFilterChange({ niche: e.target.value })}
              className="w-full bg-[#1a1a1e] border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
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
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 mb-1">
              Language
            </label>
            <select
              value={filters.language}
              onChange={(e) => onFilterChange({ language: e.target.value })}
              className="w-full bg-[#1a1a1e] border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
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
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 mb-1">
              Country
            </label>
            <select
              value={filters.country}
              onChange={(e) => onFilterChange({ country: e.target.value })}
              className="w-full bg-[#1a1a1e] border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
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
          {isAdmin && (
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-yellow-400 mb-1">
                CRM Stage
              </label>
              <select
                value={filters.stage}
                onChange={(e) => onFilterChange({ stage: e.target.value })}
                className="w-full bg-amber-950/30 border border-yellow-500/40 rounded-xl px-2.5 py-1.5 text-xs text-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
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
          )}

          {/* Sort By Dropdown */}
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 mb-1">
              Sort By
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => onFilterChange({ sortBy: e.target.value as any })}
              className="w-full bg-[#1a1a1e] border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <option value="distance">
                📍 Nearest to Me (Near Me)
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
        <div className="bg-[#141417] border border-zinc-800 rounded-2xl p-12 text-center text-zinc-400">
          <PodcastIcon className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="font-extrabold text-zinc-200 text-base mb-1">No podcasts match your filters</h3>
          <p className="text-xs text-zinc-400 mb-4 max-w-sm mx-auto">
            Try adjusting your search query, location, or category filters to view more podcasts.
          </p>
          <button
            onClick={onResetFilters}
            className="px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold text-xs rounded-xl shadow-lg transition"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2 w-full">
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

import React from 'react';
import { Podcast, UserLocation } from '../types';
import { CRM_STAGE_CONFIG, calculateDistanceKm, parseYouTubeChannel } from '../utils/geo';
import { MapPin, Youtube, Globe, User, Star, ArrowUpRight, MessageSquare } from 'lucide-react';

interface PodcastCardProps {
  podcast: Podcast;
  isSelected: boolean;
  onSelect: (id: string) => void;
  userLocation: UserLocation | null;
  isAdmin: boolean;
  onStageChange?: (id: string, stage: any) => void;
}

export const PodcastCard: React.FC<PodcastCardProps> = ({
  podcast,
  isSelected,
  onSelect,
  userLocation,
  isAdmin,
  onStageChange,
}) => {
  const stageConfig = CRM_STAGE_CONFIG[podcast.stage] || CRM_STAGE_CONFIG.notknow;
  const ytInfo = parseYouTubeChannel(podcast.youtubeUrl);

  const distanceKm =
    userLocation && podcast.latitude && podcast.longitude
      ? calculateDistanceKm(
          userLocation.latitude,
          userLocation.longitude,
          podcast.latitude,
          podcast.longitude
        )
      : null;

  return (
    <div
      onClick={() => onSelect(podcast.id)}
      className={`group relative bg-slate-900/80 hover:bg-slate-900 border rounded-2xl p-4 transition-all duration-200 cursor-pointer flex flex-col justify-between ${
        isSelected
          ? 'border-purple-500 ring-2 ring-purple-500/40 shadow-xl shadow-purple-950/20 bg-slate-900'
          : 'border-slate-800 hover:border-slate-700 shadow-sm hover:shadow-md'
      }`}
    >
      <div>
        {/* Top Header Row */}
        <div className="flex items-start gap-3 mb-3">
          {/* Cover Image */}
          <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-slate-700/60 bg-slate-800">
            <img
              src={podcast.coverImage}
              alt={podcast.name}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              onError={(e) => {
                // Fallback image
                (e.target as HTMLElement).setAttribute(
                  'src',
                  'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400&auto=format&fit=crop&q=80'
                );
              }}
            />
            {podcast.rating && (
              <div className="absolute bottom-1 right-1 bg-slate-950/80 backdrop-blur text-amber-400 font-bold text-[10px] px-1 py-0.2 rounded flex items-center gap-0.5">
                <Star className="w-2.5 h-2.5 fill-amber-400" />
                {podcast.rating}
              </div>
            )}
          </div>

          {/* Title & Metadata */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider">
                {podcast.niche}
              </span>

              {/* Distance Pill */}
              {distanceKm !== null && (
                <span className="text-[10px] font-medium text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700/60 flex items-center gap-1 shrink-0">
                  <MapPin className="w-2.5 h-2.5 text-rose-400" />
                  {distanceKm < 1 ? 'Nearby' : `${distanceKm.toLocaleString()} km`}
                </span>
              )}
            </div>

            <h3 className="font-bold text-base text-slate-100 group-hover:text-purple-300 transition line-clamp-1">
              {podcast.name}
            </h3>

            <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
              <span className="flex items-center gap-1 truncate">
                <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                {podcast.city}, {podcast.country}
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1 shrink-0">
                <Globe className="w-3 h-3 text-slate-500" />
                {podcast.language}
              </span>
            </div>
          </div>
        </div>

        {/* Short Description */}
        <p className="text-xs text-slate-300/80 line-clamp-2 mb-3 leading-relaxed">
          {podcast.description}
        </p>

        {/* Hosts & YouTube Tag */}
        <div className="space-y-2 mb-3 text-xs">
          {podcast.hosts && podcast.hosts.length > 0 && (
            <div className="flex items-center gap-1.5 text-slate-400">
              <User className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="truncate">
                <span className="text-slate-500">Hosts:</span>{' '}
                <strong className="text-slate-200 font-medium">
                  {podcast.hosts.map((h) => h.name).join(', ')}
                </strong>
              </span>
            </div>
          )}

          <a
            href={ytInfo.cleanUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 text-[11px] font-medium text-rose-400 hover:text-rose-300 bg-rose-950/30 hover:bg-rose-950/60 px-2.5 py-1 rounded-lg border border-rose-800/40 transition"
          >
            <Youtube className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
            <span>{ytInfo.handle}</span>
            <ArrowUpRight className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Card Footer: Admin CRM Dropbox or Public Details Action */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
        {isAdmin ? (
          <div className="flex items-center gap-2 w-full justify-between" onClick={(e) => e.stopPropagation()}>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
              Stage:
            </span>
            <select
              value={podcast.stage}
              onChange={(e) => onStageChange && onStageChange(podcast.id, e.target.value)}
              className={`text-xs font-semibold px-2.5 py-1 rounded-lg border focus:outline-none cursor-pointer transition ${stageConfig.badgeBg} ${stageConfig.badgeText} ${stageConfig.border}`}
            >
              <option value="notknow">1. Not Known</option>
              <option value="viewed">2. Viewed / Researched</option>
              <option value="contacted">3. Contacted</option>
              <option value="lead">4. Lead / Warm</option>
              <option value="partner">5. Partner</option>
              <option value="customer">6. Customer / Client</option>
              <option value="ex-customer">7. Ex-Customer</option>
            </select>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full">
            <span className="text-[11px] text-slate-400 font-medium">
              {podcast.estimatedAudience || 'Active Podcast'}
            </span>
            <button
              onClick={() => onSelect(podcast.id)}
              className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
            >
              <span>View CRM Card</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Admin Note Badge Counter */}
      {isAdmin && podcast.notes && podcast.notes.length > 0 && (
        <div className="absolute top-3 right-3 bg-slate-800/90 text-purple-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-700 flex items-center gap-1">
          <MessageSquare className="w-2.5 h-2.5 text-purple-400" />
          {podcast.notes.length}
        </div>
      )}
    </div>
  );
};

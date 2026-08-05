import React from 'react';
import { Podcast, UserLocation } from '../types';
import { CRM_STAGE_CONFIG } from '../utils/geo';
import { ArrowUpRight, MessageSquare } from 'lucide-react';

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
  isAdmin,
  onStageChange,
}) => {
  const isStudio = podcast.entityType === 'studio';
  const stageConfig = CRM_STAGE_CONFIG[podcast.stage] || CRM_STAGE_CONFIG.notknow;

  return (
    <div
      onClick={() => onSelect(podcast.id)}
      className={`group relative bg-[#131316] hover:bg-[#18181c] border rounded-xl px-3 py-2 transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 w-full ${
        isSelected
          ? 'border-yellow-400 ring-1 ring-yellow-400/40 shadow-lg bg-[#18181d]'
          : 'border-zinc-800/80 hover:border-yellow-500/50 shadow-sm'
      }`}
    >
      {/* Left: Image, Title & Temas / Tags */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Photo / Cover Image */}
        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-zinc-700/60 bg-zinc-900 shadow-sm">
          <img
            src={podcast.coverImage}
            alt={podcast.name}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            onError={(e) => {
              (e.target as HTMLElement).setAttribute(
                'src',
                'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400&auto=format&fit=crop&q=80'
              );
            }}
          />
        </div>

        {/* Title + Niche / StudioType / Topics Temas */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1 flex-wrap">
          <h3 className="font-extrabold text-xs sm:text-sm text-zinc-100 group-hover:text-yellow-400 transition truncate shrink-0 max-w-[180px] sm:max-w-[280px]">
            {podcast.name}
          </h3>

          {/* Temas / Category Badge */}
          <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
            <span
              className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded ${
                isStudio
                  ? 'bg-amber-400 text-black border border-amber-300 font-black'
                  : 'bg-yellow-400/10 text-yellow-400 border border-yellow-500/30'
              }`}
            >
              {isStudio ? `Studio • ${podcast.studioType || 'Facility'}` : podcast.niche}
            </span>
            {podcast.topics && podcast.topics.length > 0 && (
              podcast.topics.slice(0, 2).map((topic, i) => (
                <span
                  key={i}
                  className="text-[9px] font-semibold text-zinc-400 bg-zinc-800/80 px-1.5 py-0.5 rounded border border-zinc-700/60 hidden sm:inline-block"
                >
                  {topic}
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Right Side: Admin controls or details indicator */}
      <div className="flex items-center gap-2 shrink-0">
        {isAdmin && (
          <div onClick={(e) => e.stopPropagation()} className="shrink-0">
            <select
              value={podcast.stage}
              onChange={(e) => onStageChange && onStageChange(podcast.id, e.target.value)}
              className={`text-[10px] font-bold px-2 py-0.5 rounded border focus:outline-none cursor-pointer transition ${stageConfig.badgeBg} ${stageConfig.badgeText} ${stageConfig.border}`}
            >
              <option value="notknow">1. Not Known</option>
              <option value="viewed">2. Viewed</option>
              <option value="contacted">3. Contacted</option>
              <option value="lead">4. Lead</option>
              <option value="partner">5. Partner</option>
              <option value="customer">6. Customer</option>
              <option value="ex-customer">7. Ex-Customer</option>
            </select>
          </div>
        )}

        {isAdmin && podcast.notes && podcast.notes.length > 0 && (
          <div className="bg-zinc-900 text-yellow-400 text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-yellow-500/30 flex items-center gap-0.5 shrink-0">
            <MessageSquare className="w-2.5 h-2.5 text-yellow-400" />
            {podcast.notes.length}
          </div>
        )}

        <div className="text-[11px] font-bold text-zinc-500 group-hover:text-yellow-400 transition flex items-center gap-0.5 shrink-0 pl-1">
          <ArrowUpRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};


import React from 'react';
import { Podcast, CRMStage } from '../../types';
import { CRM_STAGE_CONFIG } from '../../utils/geo';
import { Plus, Youtube, MapPin, Star, MessageSquare, ArrowRightLeft } from 'lucide-react';

interface CRMKanbanProps {
  podcasts: Podcast[];
  onSelectPodcast: (id: string) => void;
  onStageChange: (id: string, stage: CRMStage) => void;
  onOpenAddModalWithStage: (stage: CRMStage) => void;
}

const STAGES_LIST: CRMStage[] = [
  'notknow',
  'viewed',
  'contacted',
  'lead',
  'partner',
  'customer',
  'ex-customer',
];

export const CRMKanban: React.FC<CRMKanbanProps> = ({
  podcasts,
  onSelectPodcast,
  onStageChange,
  onOpenAddModalWithStage,
}) => {
  return (
    <div className="space-y-4">
      {/* Kanban Scrollable Container */}
      <div className="overflow-x-auto pb-6">
        <div className="flex gap-4 min-w-[1400px]">
          {STAGES_LIST.map((stageKey) => {
            const stageConfig = CRM_STAGE_CONFIG[stageKey];
            const stagePodcasts = podcasts.filter((p) => p.stage === stageKey);

            return (
              <div
                key={stageKey}
                className="w-80 shrink-0 bg-slate-900/90 border border-slate-800/90 rounded-2xl flex flex-col max-h-[75vh] shadow-xl"
              >
                {/* Column Header */}
                <div className="p-3.5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900 rounded-t-2xl z-10">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: stageConfig.dotColor }}
                    />
                    <h3 className="font-bold text-xs text-slate-100 truncate">
                      {stageConfig.label}
                    </h3>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                      {stagePodcasts.length}
                    </span>
                  </div>

                  <button
                    onClick={() => onOpenAddModalWithStage(stageKey)}
                    className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                    title={`Add new podcast directly to ${stageConfig.label}`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Column Cards Container */}
                <div className="p-3 flex-1 overflow-y-auto space-y-3">
                  {stagePodcasts.length === 0 ? (
                    <div className="border border-dashed border-slate-800 rounded-xl p-6 text-center text-xs text-slate-500 italic">
                      No podcasts in this stage
                    </div>
                  ) : (
                    stagePodcasts.map((podcast) => (
                      <div
                        key={podcast.id}
                        onClick={() => onSelectPodcast(podcast.id)}
                        className="bg-slate-950/80 hover:bg-slate-950 border border-slate-800/80 hover:border-slate-700 p-3 rounded-xl shadow-md transition group cursor-pointer space-y-2.5"
                      >
                        {/* Header info */}
                        <div className="flex items-start gap-2.5">
                          <img
                            src={podcast.coverImage}
                            alt={podcast.name}
                            className="w-12 h-12 rounded-lg object-cover shrink-0 border border-slate-700/60"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-[9px] uppercase font-semibold text-purple-400 tracking-wider block truncate">
                              {podcast.niche}
                            </span>
                            <h4 className="font-bold text-xs text-slate-100 group-hover:text-purple-300 transition line-clamp-1">
                              {podcast.name}
                            </h4>
                            <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                              <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                              {podcast.city}, {podcast.country}
                            </p>
                          </div>
                        </div>

                        {/* Contacts overview */}
                        <div className="text-[11px] text-slate-400 bg-slate-900/60 p-2 rounded-lg space-y-1">
                          {podcast.hosts && podcast.hosts.length > 0 && (
                            <div className="truncate">
                              <span className="text-slate-500 font-semibold">Host:</span>{' '}
                              <span className="text-slate-200">{podcast.hosts[0].name}</span>
                              {podcast.hosts[0].email && (
                                <span className="text-slate-500 text-[10px] block truncate">
                                  {podcast.hosts[0].email}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Stage Move Dropbox Selector */}
                        <div
                          className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="text-slate-500 flex items-center gap-1 font-semibold text-[10px] uppercase">
                            <ArrowRightLeft className="w-3 h-3 text-purple-400" />
                            Move:
                          </span>
                          <select
                            value={podcast.stage}
                            onChange={(e) => onStageChange(podcast.id, e.target.value as CRMStage)}
                            className="bg-slate-900 border border-slate-700/80 text-slate-200 text-[11px] rounded-lg px-2 py-0.5 focus:outline-none cursor-pointer"
                          >
                            {STAGES_LIST.map((stg) => (
                              <option key={stg} value={stg}>
                                {CRM_STAGE_CONFIG[stg].label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Activity notes indicator */}
                        {podcast.notes && podcast.notes.length > 0 && (
                          <div className="flex items-center gap-1 text-[10px] text-purple-300 font-medium">
                            <MessageSquare className="w-2.5 h-2.5 text-purple-400" />
                            <span>{podcast.notes.length} notes</span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

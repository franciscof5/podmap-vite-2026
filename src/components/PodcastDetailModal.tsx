import React, { useState } from 'react';
import { Podcast, CRMStage } from '../types';
import { CRM_STAGE_CONFIG, parseYouTubeChannel } from '../utils/geo';
import {
  X,
  MapPin,
  Globe,
  Youtube,
  User,
  Mail,
  Phone,
  Star,
  MessageSquare,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  ShieldAlert,
  Building,
  Users
} from 'lucide-react';

interface PodcastDetailModalProps {
  podcast: Podcast | null;
  onClose: () => void;
  isAdmin: boolean;
  onStageChange: (id: string, stage: CRMStage) => void;
  onAddNote: (id: string, text: string) => void;
  onDeleteNote: (podcastId: string, noteId: string) => void;
  onEditPodcast: (podcast: Podcast) => void;
  onDeletePodcast: (id: string) => void;
}

export const PodcastDetailModal: React.FC<PodcastDetailModalProps> = ({
  podcast,
  onClose,
  isAdmin,
  onStageChange,
  onAddNote,
  onDeleteNote,
  onEditPodcast,
  onDeletePodcast,
}) => {
  const [newNoteText, setNewNoteText] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'contacts' | 'notes'>('overview');

  if (!podcast) return null;

  const stageConfig = CRM_STAGE_CONFIG[podcast.stage] || CRM_STAGE_CONFIG.notknow;
  const ytInfo = parseYouTubeChannel(podcast.youtubeUrl);

  const handleNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    onAddNote(podcast.id, newNoteText.trim());
    setNewNoteText('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl my-8">
        
        {/* Banner Image & Close */}
        <div className="relative h-44 sm:h-52 w-full bg-slate-950 overflow-hidden">
          <img
            src={podcast.coverImage}
            alt={podcast.name}
            className="w-full h-full object-cover blur-sm opacity-40 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/80 text-slate-400 hover:text-white border border-slate-700/80 transition"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Podcast Header Info Over Banner */}
          <div className="absolute bottom-4 left-6 right-6 flex items-end gap-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-slate-700 shadow-2xl shrink-0 bg-slate-800">
              <img
                src={podcast.coverImage}
                alt={podcast.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0 pb-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-purple-950/90 text-purple-300 border border-purple-800/50">
                  {podcast.niche}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                  {podcast.language}
                </span>
                {podcast.rating && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-950/80 text-amber-400 border border-amber-800/50 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400" />
                    {podcast.rating}/5
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white truncate">
                {podcast.name}
              </h2>
              <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                {podcast.city}, {podcast.state}, {podcast.country}
              </p>
            </div>
          </div>
        </div>

        {/* Admin Stage Bar */}
        {isAdmin && (
          <div className="bg-slate-950/90 px-6 py-3 border-y border-slate-800 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-slate-300">Secret CRM Pipeline Stage:</span>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={podcast.stage}
                onChange={(e) => onStageChange(podcast.id, e.target.value as CRMStage)}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg border focus:outline-none cursor-pointer ${stageConfig.badgeBg} ${stageConfig.badgeText} ${stageConfig.border}`}
              >
                <option value="notknow">1. Not Known</option>
                <option value="viewed">2. Viewed / Researched</option>
                <option value="contacted">3. Contacted</option>
                <option value="lead">4. Lead / Warm</option>
                <option value="partner">5. Partner</option>
                <option value="customer">6. Customer / Client</option>
                <option value="ex-customer">7. Ex-Customer</option>
              </select>

              <button
                onClick={() => onEditPodcast(podcast)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                title="Edit Podcast details"
              >
                <Edit3 className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  if (confirm(`Are you sure you want to delete ${podcast.name} from CRM?`)) {
                    onDeletePodcast(podcast.id);
                    onClose();
                  }
                }}
                className="p-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900 text-rose-300 border border-rose-800/50 transition"
                title="Delete Podcast"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Modal Tabs Navigation */}
        <div className="px-6 border-b border-slate-800 flex items-center gap-6 text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 border-b-2 transition ${
              activeTab === 'overview'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Overview & Channel
          </button>
          <button
            onClick={() => setActiveTab('contacts')}
            className={`py-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'contacts'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Hosts & Producers</span>
            <span className="bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded-full text-[10px]">
              {(podcast.hosts?.length || 0) + (podcast.producers?.length || 0)}
            </span>
          </button>
          {isAdmin && (
            <button
              onClick={() => setActiveTab('notes')}
              className={`py-3 border-b-2 transition flex items-center gap-1.5 ${
                activeTab === 'notes'
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Internal CRM Notes</span>
              {podcast.notes && podcast.notes.length > 0 && (
                <span className="bg-purple-900 text-purple-300 px-1.5 py-0.2 rounded-full text-[10px]">
                  {podcast.notes.length}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Modal Tab Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Description */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  About Podcast
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                  {podcast.description}
                </p>
              </div>

              {/* YouTube Channel Banner */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-rose-600/20 text-rose-500 flex items-center justify-center border border-rose-500/30 shrink-0">
                    <Youtube className="w-6 h-6 fill-rose-500" />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-white">{ytInfo.handle}</h5>
                    <p className="text-xs text-slate-400">
                      {podcast.estimatedAudience || 'Official YouTube Channel'}
                    </p>
                  </div>
                </div>
                <a
                  href={ytInfo.cleanUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow transition"
                >
                  <span>Open Channel</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Location Details */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold mb-1">
                    Country
                  </span>
                  <span className="font-semibold text-slate-200">{podcast.country}</span>
                </div>
                <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold mb-1">
                    State / City
                  </span>
                  <span className="font-semibold text-slate-200">
                    {podcast.state ? `${podcast.city}, ${podcast.state}` : podcast.city}
                  </span>
                </div>
                <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800 col-span-2 sm:col-span-1">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold mb-1">
                    Coordinates
                  </span>
                  <span className="font-mono text-slate-300">
                    {podcast.latitude.toFixed(4)}, {podcast.longitude.toFixed(4)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CONTACTS (HOSTS & PRODUCERS) */}
          {activeTab === 'contacts' && (
            <div className="space-y-6">
              
              {/* Hosts Section */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-3 flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  <span>Podcast Hosts ({podcast.hosts?.length || 0})</span>
                </h4>
                {podcast.hosts && podcast.hosts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {podcast.hosts.map((host) => (
                      <div
                        key={host.id}
                        className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-2"
                      >
                        <div className="font-bold text-slate-100 text-sm">{host.name}</div>
                        {host.role && (
                          <div className="text-[11px] text-purple-300 font-medium">{host.role}</div>
                        )}
                        {isAdmin ? (
                          <div className="space-y-1 text-xs pt-1 border-t border-slate-800/80">
                            {host.email && (
                              <a
                                href={`mailto:${host.email}`}
                                className="flex items-center gap-1.5 text-slate-300 hover:text-purple-300 transition"
                              >
                                <Mail className="w-3.5 h-3.5 text-slate-500" />
                                <span>{host.email}</span>
                              </a>
                            )}
                            {host.phone && (
                              <a
                                href={`tel:${host.phone}`}
                                className="flex items-center gap-1.5 text-slate-300 hover:text-purple-300 transition"
                              >
                                <Phone className="w-3.5 h-3.5 text-slate-500" />
                                <span>{host.phone}</span>
                              </a>
                            )}
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-500 italic">
                            Contact details available in Secret Admin CRM mode.
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No hosts listed.</p>
                )}
              </div>

              {/* Producers Section */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-3 flex items-center gap-1.5">
                  <Building className="w-4 h-4" />
                  <span>Podcast Producers & Studio ({podcast.producers?.length || 0})</span>
                </h4>
                {podcast.producers && podcast.producers.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {podcast.producers.map((prod) => (
                      <div
                        key={prod.id}
                        className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-2"
                      >
                        <div className="font-bold text-slate-100 text-sm">{prod.name}</div>
                        {prod.role && (
                          <div className="text-[11px] text-indigo-300 font-medium">{prod.role}</div>
                        )}
                        {isAdmin ? (
                          <div className="space-y-1 text-xs pt-1 border-t border-slate-800/80">
                            {prod.email && (
                              <a
                                href={`mailto:${prod.email}`}
                                className="flex items-center gap-1.5 text-slate-300 hover:text-indigo-300 transition"
                              >
                                <Mail className="w-3.5 h-3.5 text-slate-500" />
                                <span>{prod.email}</span>
                              </a>
                            )}
                            {prod.phone && (
                              <a
                                href={`tel:${prod.phone}`}
                                className="flex items-center gap-1.5 text-slate-300 hover:text-indigo-300 transition"
                              >
                                <Phone className="w-3.5 h-3.5 text-slate-500" />
                                <span>{prod.phone}</span>
                              </a>
                            )}
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-500 italic">
                            Contact details available in Secret Admin CRM mode.
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No producers listed.</p>
                )}
              </div>

            </div>
          )}

          {/* TAB 3: INTERNAL CRM NOTES (ADMIN ONLY) */}
          {activeTab === 'notes' && isAdmin && (
            <div className="space-y-4">
              
              {/* Add Note Form */}
              <form onSubmit={handleNoteSubmit} className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">
                  Add Activity Log / Contact Note
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Sent rate card proposal via email, follow up on Monday..."
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-xl flex items-center gap-1 shadow transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Note</span>
                  </button>
                </div>
              </form>

              {/* Notes List Feed */}
              <div className="space-y-2 pt-2">
                {podcast.notes && podcast.notes.length > 0 ? (
                  podcast.notes.map((note) => (
                    <div
                      key={note.id}
                      className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex items-start justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-purple-400">{note.author}</span>
                          <span className="text-[10px] text-slate-500">{note.date}</span>
                        </div>
                        <p className="text-slate-300 leading-normal">{note.text}</p>
                      </div>
                      <button
                        onClick={() => onDeleteNote(podcast.id, note.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 transition shrink-0"
                        title="Delete note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-500 text-xs italic bg-slate-950/40 rounded-xl border border-slate-800">
                    No CRM activity notes recorded yet for this podcast.
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Added {new Date(podcast.createdAt).toLocaleDateString()}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

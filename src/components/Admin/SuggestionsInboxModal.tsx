import React from 'react';
import { PodcastSuggestion } from '../../types';
import { parseYouTubeChannel } from '../../utils/geo';
import { X, Inbox, Check, Trash2, Youtube, MapPin, ExternalLink, MessageSquare } from 'lucide-react';

interface SuggestionsInboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  suggestions: PodcastSuggestion[];
  onApprove: (suggestion: PodcastSuggestion) => void;
  onReject: (id: string) => void;
}

export const SuggestionsInboxModal: React.FC<SuggestionsInboxModalProps> = ({
  isOpen,
  onClose,
  suggestions,
  onApprove,
  onReject,
}) => {
  if (!isOpen) return null;

  const pendingList = suggestions.filter((s) => s.status === 'pending');

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
        
        {/* Header */}
        <div className="bg-slate-950 p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-950/80 text-amber-400 border border-amber-800/50">
              <Inbox className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                Pending Suggestions Inbox
                <span className="text-xs bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded-full">
                  {pendingList.length}
                </span>
              </h3>
              <p className="text-xs text-slate-400">Review public user suggestions and insert into CRM</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
          {pendingList.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm italic">
              No pending suggestions right now.
            </div>
          ) : (
            pendingList.map((sug) => {
              const yt = parseYouTubeChannel(sug.youtubeUrl);

              return (
                <div
                  key={sug.id}
                  className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block mb-0.5">
                        {sug.niche} • {sug.language}
                      </span>
                      <h4 className="font-bold text-base text-white">{sug.podcastName}</h4>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-rose-400" />
                        {sug.city}, {sug.state ? `${sug.state}, ` : ''}{sug.country}
                      </p>
                    </div>

                    <a
                      href={yt.cleanUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-rose-400 bg-rose-950/40 hover:bg-rose-950/80 border border-rose-800/50 px-2.5 py-1 rounded-lg transition shrink-0"
                    >
                      <Youtube className="w-3.5 h-3.5 fill-rose-500" />
                      <span>YouTube</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* Submitter Note & Contacts */}
                  {sug.submitterNote && (
                    <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                      <MessageSquare className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] text-amber-400 font-bold block uppercase">
                          Submitter Note:
                        </span>
                        <p>{sug.submitterNote}</p>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-500">
                      Submitted {new Date(sug.createdAt).toLocaleDateString()}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onReject(sug.id)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 text-slate-300 font-medium text-xs border border-slate-700 hover:border-rose-800/60 transition flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Dismiss</span>
                      </button>

                      <button
                        onClick={() => onApprove(sug)}
                        className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow transition flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve & Add to CRM</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition"
          >
            Close Inbox
          </button>
        </div>

      </div>
    </div>
  );
};

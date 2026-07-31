import React, { useState } from 'react';
import { PodcastSuggestion } from '../types';
import { KNOWN_CITY_COORDINATES } from '../utils/geo';
import { X, Youtube, Sparkles, CheckCircle2, MapPin, Globe, User } from 'lucide-react';

interface SuggestPodcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuggestion: (suggestion: Omit<PodcastSuggestion, 'id' | 'createdAt' | 'status'>) => void;
}

export const SuggestPodcastModal: React.FC<SuggestPodcastModalProps> = ({
  isOpen,
  onClose,
  onSubmitSuggestion,
}) => {
  const [podcastName, setPodcastName] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [country, setCountry] = useState('USA');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [language, setLanguage] = useState('English');
  const [niche, setNiche] = useState('Tech & AI');
  const [hostName, setHostName] = useState('');
  const [hostEmail, setHostEmail] = useState('');
  const [hostPhone, setHostPhone] = useState('');
  const [producerName, setProducerName] = useState('');
  const [producerEmail, setProducerEmail] = useState('');
  const [submitterNote, setSubmitterNote] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!podcastName.trim() || !youtubeUrl.trim()) return;

    onSubmitSuggestion({
      podcastName: podcastName.trim(),
      youtubeUrl: youtubeUrl.trim(),
      country: country.trim() || 'USA',
      state: state.trim(),
      city: city.trim() || 'Unspecified',
      language: language.trim() || 'English',
      niche: niche.trim() || 'General',
      hosts: hostName.trim()
        ? [{ id: `sh-${Date.now()}`, name: hostName.trim(), email: hostEmail.trim(), phone: hostPhone.trim() }]
        : [],
      producers: producerName.trim()
        ? [{ id: `sp-${Date.now()}`, name: producerName.trim(), email: producerEmail.trim(), phone: '' }]
        : [],
      submitterNote: submitterNote.trim(),
    });

    setSubmittedSuccess(true);
    setTimeout(() => {
      setSubmittedSuccess(false);
      onClose();
    }, 2000);
  };

  const handleCityChange = (cityName: string) => {
    setCity(cityName);
    if (KNOWN_CITY_COORDINATES[cityName]) {
      setCountry(KNOWN_CITY_COORDINATES[cityName].country);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl my-8">
        
        {/* Header */}
        <div className="bg-slate-950 p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Suggest a Podcast</h3>
              <p className="text-xs text-slate-400">Propose a podcast channel for the map directory & CRM</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form or Success View */}
        {submittedSuccess ? (
          <div className="p-10 text-center space-y-3">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="font-bold text-xl text-white">Thank You!</h4>
            <p className="text-sm text-slate-300 max-w-md mx-auto">
              Your podcast suggestion has been sent to the Admin queue for approval!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            
            {/* YouTube URL (Required) */}
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1 flex items-center gap-1.5">
                <Youtube className="w-4 h-4 text-rose-500" />
                <span>YouTube Channel URL <span className="text-rose-400">*</span></span>
              </label>
              <input
                type="url"
                required
                placeholder="https://www.youtube.com/@podcastname"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Podcast Name (Required) */}
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">
                Podcast Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. The Tech Breakdown"
                value={podcastName}
                onChange={(e) => setPodcastName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Category / Niche & Language */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">Niche Category</label>
                <select
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Tech & AI">Tech & AI</option>
                  <option value="Business & Entrepreneurship">Business & Entrepreneurship</option>
                  <option value="Comedy & Society">Comedy & Society</option>
                  <option value="Health & Science">Health & Science</option>
                  <option value="Pop Culture & Entertainment">Pop Culture & Entertainment</option>
                  <option value="True Crime">True Crime</option>
                  <option value="Education & News">Education & News</option>
                  <option value="Music & Culture">Music & Culture</option>
                  <option value="Sports & Gaming">Sports & Gaming</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">Language</label>
                <input
                  type="text"
                  placeholder="e.g. English, Portuguese, Spanish"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Location (Country, State, City) */}
            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-3">
              <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-rose-400" />
                <span>Podcast Studio Location</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-0.5">City</label>
                  <input
                    type="text"
                    placeholder="e.g. Austin, São Paulo"
                    value={city}
                    onChange={(e) => handleCityChange(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-0.5">State</label>
                  <input
                    type="text"
                    placeholder="e.g. Texas, SP"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-0.5">Country</label>
                  <input
                    type="text"
                    placeholder="e.g. USA, Brazil"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Optional Host & Producer Info */}
            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-3">
              <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <User className="w-4 h-4 text-indigo-400" />
                <span>Host or Producer Contact (Optional)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Host Name"
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none"
                />
                <input
                  type="email"
                  placeholder="Host Email"
                  value={hostEmail}
                  onChange={(e) => setHostEmail(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none"
                />
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">
                Note / Message for Admin
              </label>
              <textarea
                rows={2}
                placeholder="Why should this podcast be added to the CRM map?"
                value={submitterNote}
                onChange={(e) => setSubmitterNote(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl shadow-md transition"
              >
                Submit Suggestion
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};

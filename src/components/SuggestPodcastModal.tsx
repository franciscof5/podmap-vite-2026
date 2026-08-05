import React, { useState, useMemo } from 'react';
import { PodcastSuggestion, Podcast, ContactPerson } from '../types';
import { KNOWN_CITY_COORDINATES } from '../utils/geo';
import { LocationAutocomplete, LocationData } from './LocationAutocomplete';
import {
  X,
  Youtube,
  Instagram,
  Sparkles,
  CheckCircle2,
  MapPin,
  Globe,
  User,
  Plus,
  Trash2,
  Building2,
  Phone,
  Mail,
  Linkedin,
  Video,
  Building
} from 'lucide-react';

interface SuggestPodcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuggestion: (suggestion: Omit<PodcastSuggestion, 'id' | 'createdAt' | 'status'>) => void;
  existingStudios?: Podcast[];
  allPodcasts?: Podcast[];
}

export const SuggestPodcastModal: React.FC<SuggestPodcastModalProps> = ({
  isOpen,
  onClose,
  onSubmitSuggestion,
  existingStudios = [],
  allPodcasts = [],
}) => {
  const [podcastName, setPodcastName] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [tiktokUrl, setTiktokUrl] = useState('');

  // Target Location
  const [singleLocationInput, setSingleLocationInput] = useState('São Paulo, SP, Brazil');
  const [country, setCountry] = useState('Brazil');
  const [state, setState] = useState('SP');
  const [city, setCity] = useState('São Paulo');

  const [language, setLanguage] = useState('Portuguese');
  const [niche, setNiche] = useState('Tech & AI');

  // Studio Selection
  const [selectedStudioId, setSelectedStudioId] = useState<string>('not_now');
  const [customStudioName, setCustomStudioName] = useState<string>('');

  // Multiple Hosts
  const [hosts, setHosts] = useState<Array<{
    name: string;
    whatsapp: string;
    email: string;
    instagram: string;
    linkedin: string;
  }>>([
    { name: '', whatsapp: '', email: '', instagram: '', linkedin: '' }
  ]);

  // Multiple Producers
  const [producers, setProducers] = useState<Array<{
    name: string;
    whatsapp: string;
    email: string;
    instagram: string;
    linkedin: string;
  }>>([
    { name: '', whatsapp: '', email: '', instagram: '', linkedin: '' }
  ]);

  const [submitterNote, setSubmitterNote] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Known contacts for autocomplete
  const knownContacts = useMemo(() => {
    const map = new Map<string, ContactPerson>();
    allPodcasts.forEach((p) => {
      [...(p.hosts || []), ...(p.producers || [])].forEach((c) => {
        if (c.name) {
          map.set(c.name.toLowerCase().trim(), c);
        }
      });
    });
    return Array.from(map.values());
  }, [allPodcasts]);

  if (!isOpen) return null;

  const handleLocationSelect = (loc: LocationData) => {
    setSingleLocationInput(loc.formattedLocation);
    setCity(loc.city);
    setState(loc.state);
    setCountry(loc.country);
  };

  const handleAddHost = () => {
    setHosts([
      ...hosts,
      { name: '', whatsapp: '', email: '', instagram: '', linkedin: '' }
    ]);
  };

  const handleRemoveHost = (index: number) => {
    if (hosts.length <= 1) return;
    setHosts(hosts.filter((_, i) => i !== index));
  };

  const handleAddProducer = () => {
    setProducers([
      ...producers,
      { name: '', whatsapp: '', email: '', instagram: '', linkedin: '' }
    ]);
  };

  const handleRemoveProducer = (index: number) => {
    if (producers.length <= 1) return;
    setProducers(producers.filter((_, i) => i !== index));
  };

  const handleHostNameChange = (index: number, nameVal: string) => {
    const updated = [...hosts];
    updated[index].name = nameVal;

    const match = knownContacts.find((c) => c.name.toLowerCase() === nameVal.toLowerCase().trim());
    if (match) {
      if (match.email) updated[index].email = match.email;
      if (match.whatsapp || match.phone) updated[index].whatsapp = match.whatsapp || match.phone || '';
      if (match.instagram) updated[index].instagram = match.instagram;
      if (match.linkedin) updated[index].linkedin = match.linkedin;
    }
    setHosts(updated);
  };

  const handleProducerNameChange = (index: number, nameVal: string) => {
    const updated = [...producers];
    updated[index].name = nameVal;

    const match = knownContacts.find((c) => c.name.toLowerCase() === nameVal.toLowerCase().trim());
    if (match) {
      if (match.email) updated[index].email = match.email;
      if (match.whatsapp || match.phone) updated[index].whatsapp = match.whatsapp || match.phone || '';
      if (match.instagram) updated[index].instagram = match.instagram;
      if (match.linkedin) updated[index].linkedin = match.linkedin;
    }
    setProducers(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!podcastName.trim()) return;

    // Resolve studio name
    let studioNameResolved = 'Studio Not Listed / Not Now';
    if (selectedStudioId !== 'not_now' && selectedStudioId !== 'custom') {
      const found = existingStudios.find((s) => s.id === selectedStudioId);
      if (found) studioNameResolved = found.name;
    } else if (selectedStudioId === 'custom' && customStudioName.trim()) {
      studioNameResolved = customStudioName.trim();
    }

    // Format hosts list
    const formattedHosts: ContactPerson[] = hosts
      .filter((h) => h.name.trim().length > 0)
      .map((h, idx) => ({
        id: `host-${Date.now()}-${idx}`,
        name: h.name.trim(),
        whatsapp: h.whatsapp.trim(),
        phone: h.whatsapp.trim(),
        email: h.email.trim(),
        instagram: h.instagram.trim(),
        linkedin: h.linkedin.trim(),
        role: 'Host'
      }));

    // Format producers list
    const formattedProducers: ContactPerson[] = producers
      .filter((p) => p.name.trim().length > 0)
      .map((p, idx) => ({
        id: `producer-${Date.now()}-${idx}`,
        name: p.name.trim(),
        whatsapp: p.whatsapp.trim(),
        phone: p.whatsapp.trim(),
        email: p.email.trim(),
        instagram: p.instagram.trim(),
        linkedin: p.linkedin.trim(),
        role: 'Producer'
      }));

    onSubmitSuggestion({
      podcastName: podcastName.trim(),
      youtubeUrl: youtubeUrl.trim(),
      instagramUrl: instagramUrl.trim(),
      tiktokUrl: tiktokUrl.trim(),
      country: country.trim() || 'Brazil',
      state: state.trim(),
      city: city.trim() || 'Unspecified',
      language: language.trim() || 'Portuguese',
      niche: niche.trim() || 'General',
      studioId: selectedStudioId !== 'not_now' ? selectedStudioId : undefined,
      studioName: studioNameResolved,
      hosts: formattedHosts,
      producers: formattedProducers,
      submitterNote: submitterNote.trim(),
    });

    setSubmittedSuccess(true);
    setTimeout(() => {
      setSubmittedSuccess(false);
      onClose();
    }, 2000);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <datalist id="suggest-contacts-autocomplete">
        {knownContacts.map((contact, idx) => (
          <option key={idx} value={contact.name}>
            {contact.email ? `${contact.email}` : ''}
          </option>
        ))}
      </datalist>

      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
        
        {/* Header */}
        <div className="bg-slate-950 p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-yellow-400/10 text-yellow-400 border border-yellow-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Suggest a Podcast</h3>
              <p className="text-xs text-slate-400">Propose a podcast or show for our global map directory & CRM</p>
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
            <h4 className="font-bold text-xl text-white">Obrigado! / Thank You!</h4>
            <p className="text-sm text-slate-300 max-w-md mx-auto">
              Your podcast suggestion has been sent to our queue for approval!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
            
            {/* Podcast Name */}
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">
                Podcast Name / Nome do Podcast <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Flow Podcast, Inteligência Ltda, The Tech Breakdown"
                value={podcastName}
                onChange={(e) => setPodcastName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            {/* Social Channels Section (YouTube, Instagram, TikTok) */}
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
              <label className="block text-xs font-bold text-yellow-400 flex items-center gap-1.5">
                <Video className="w-4 h-4 text-yellow-400" />
                <span>Social Channels & Links (YouTube, Instagram, TikTok)</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                    <Youtube className="w-3 h-3 text-rose-500" /> YouTube Link
                  </label>
                  <input
                    type="url"
                    placeholder="https://youtube.com/@..."
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                    <Instagram className="w-3 h-3 text-pink-500" /> Instagram Link
                  </label>
                  <input
                    type="text"
                    placeholder="https://instagram.com/..."
                    value={instagramUrl}
                    onChange={(e) => setInstagramUrl(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                    <Video className="w-3 h-3 text-cyan-400" /> TikTok Link
                  </label>
                  <input
                    type="text"
                    placeholder="https://tiktok.com/@..."
                    value={tiktokUrl}
                    onChange={(e) => setTiktokUrl(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
              </div>
            </div>

            {/* Category / Niche & Language Selectbox */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">Niche Category</label>
                <select
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
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
                <label className="block text-xs font-bold text-slate-200 mb-1 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Main Language</span>
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  <option value="Portuguese">Portuguese (Português)</option>
                  <option value="English">English</option>
                  <option value="Spanish">Spanish (Español)</option>
                  <option value="Italian">Italian (Italiano)</option>
                  <option value="French">French (Français)</option>
                  <option value="German">German (Deutsch)</option>
                  <option value="Other">Other Language</option>
                </select>
              </div>
            </div>

            {/* Studio Selection & Link */}
            <div className="bg-slate-950/70 p-4 rounded-xl border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-amber-400" />
                  <span>Podcast Studio Facility</span>
                </label>
                <span className="text-[10px] text-amber-300/80 italic">Optional</span>
              </div>

              <div>
                <select
                  value={selectedStudioId}
                  onChange={(e) => setSelectedStudioId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  <option value="not_now">Studio Not Listed / Recorded Elsewhere / Studio Not Now</option>
                  {existingStudios.map((st) => (
                    <option key={st.id} value={st.id}>
                      🏢 {st.name} — {st.city}, {st.country}
                    </option>
                  ))}
                  <option value="custom">✍️ Type Custom Studio Name...</option>
                </select>
              </div>

              {selectedStudioId === 'custom' && (
                <input
                  type="text"
                  placeholder="Type Studio Name..."
                  value={customStudioName}
                  onChange={(e) => setCustomStudioName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              )}
            </div>

            {/* Single-line Location (Google Maps Integration Line) */}
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
              <label className="block text-xs font-bold text-slate-200 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-rose-400" />
                  <span>Podcast Location (Google Maps Integration Line)</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">City, State, Country</span>
              </label>

              <LocationAutocomplete
                value={singleLocationInput}
                onChange={handleLocationSelect}
                placeholder="Type a city e.g. New York, Milano, São Paulo..."
              />

              <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-0.5 font-mono">
                <span>City: <strong className="text-white">{city}</strong></span>
                <span>State: <strong className="text-white">{state || 'N/A'}</strong></span>
                <span>Country: <strong className="text-white">{country}</strong></span>
              </div>
            </div>

            {/* Multiple Hosts Section */}
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-indigo-400" />
                  <span>Hosts ({hosts.length})</span>
                </div>
                <button
                  type="button"
                  onClick={handleAddHost}
                  className="px-2.5 py-1 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-700/50 text-[11px] font-bold flex items-center gap-1 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Host</span>
                </button>
              </div>

              {hosts.map((host, index) => (
                <div key={index} className="bg-slate-900 p-3.5 rounded-xl border border-slate-800/80 space-y-2.5 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-300">
                      Host #{index + 1}
                    </span>
                    {hosts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveHost(index)}
                        className="text-slate-500 hover:text-rose-400 transition p-1"
                        title="Remove Host"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <input
                        type="text"
                        list="suggest-contacts-autocomplete"
                        placeholder="Host Name (Autocomplete)"
                        value={host.name}
                        onChange={(e) => handleHostNameChange(index, e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="WhatsApp / Phone"
                        value={host.whatsapp}
                        onChange={(e) => {
                          const updated = [...hosts];
                          updated[index].whatsapp = e.target.value;
                          setHosts(updated);
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none"
                      />
                    </div>
                    <div>
                      <input
                        type="email"
                        placeholder="E-mail"
                        value={host.email}
                        onChange={(e) => {
                          const updated = [...hosts];
                          updated[index].email = e.target.value;
                          setHosts(updated);
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Instagram (@handle or link)"
                        value={host.instagram}
                        onChange={(e) => {
                          const updated = [...hosts];
                          updated[index].instagram = e.target.value;
                          setHosts(updated);
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        placeholder="LinkedIn Profile URL"
                        value={host.linkedin}
                        onChange={(e) => {
                          const updated = [...hosts];
                          updated[index].linkedin = e.target.value;
                          setHosts(updated);
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Multiple Producers Section */}
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-cyan-400" />
                  <span>Producers ({producers.length})</span>
                </div>
                <button
                  type="button"
                  onClick={handleAddProducer}
                  className="px-2.5 py-1 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/50 text-[11px] font-bold flex items-center gap-1 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Producer</span>
                </button>
              </div>

              {producers.map((producer, index) => (
                <div key={index} className="bg-slate-900 p-3.5 rounded-xl border border-slate-800/80 space-y-2.5 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-300">
                      Producer #{index + 1}
                    </span>
                    {producers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveProducer(index)}
                        className="text-slate-500 hover:text-rose-400 transition p-1"
                        title="Remove Producer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <input
                        type="text"
                        list="suggest-contacts-autocomplete"
                        placeholder="Producer Name (Autocomplete)"
                        value={producer.name}
                        onChange={(e) => handleProducerNameChange(index, e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="WhatsApp / Phone"
                        value={producer.whatsapp}
                        onChange={(e) => {
                          const updated = [...producers];
                          updated[index].whatsapp = e.target.value;
                          setProducers(updated);
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none"
                      />
                    </div>
                    <div>
                      <input
                        type="email"
                        placeholder="E-mail"
                        value={producer.email}
                        onChange={(e) => {
                          const updated = [...producers];
                          updated[index].email = e.target.value;
                          setProducers(updated);
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Instagram Handle / Link"
                        value={producer.instagram}
                        onChange={(e) => {
                          const updated = [...producers];
                          updated[index].instagram = e.target.value;
                          setProducers(updated);
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        placeholder="LinkedIn Profile URL"
                        value={producer.linkedin}
                        onChange={(e) => {
                          const updated = [...producers];
                          updated[index].linkedin = e.target.value;
                          setProducers(updated);
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Note / Message */}
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">
                Note / Message for Admin
              </label>
              <textarea
                rows={2}
                placeholder="Why should this podcast be added to the map directory?"
                value={submitterNote}
                onChange={(e) => setSubmitterNote(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            {/* Submit Buttons */}
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
                className="px-5 py-2 bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold text-xs rounded-xl shadow-lg transition active:scale-95"
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

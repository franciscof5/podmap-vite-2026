import React, { useState, useMemo } from 'react';
import { PodcastSuggestion, Podcast, ContactPerson } from '../types';
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
  Video,
  Building,
  Link as LinkIcon,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Music,
  Globe2
} from 'lucide-react';

interface SuggestPodcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuggestion: (suggestion: Omit<PodcastSuggestion, 'id' | 'createdAt' | 'status'>) => void;
  existingStudios?: Podcast[];
  allPodcasts?: Podcast[];
  existingSuggestions?: PodcastSuggestion[];
}

export const SuggestPodcastModal: React.FC<SuggestPodcastModalProps> = ({
  isOpen,
  onClose,
  onSubmitSuggestion,
  existingStudios = [],
  allPodcasts = [],
  existingSuggestions = [],
}) => {
  // Simplified Flow State: Links Array (At least 1 required)
  const [links, setLinks] = useState<string[]>(['']);

  // Collapsible Optional Section
  const [isMoreDetailsOpen, setIsMoreDetailsOpen] = useState(false);

  // Optional Fields
  const [podcastName, setPodcastName] = useState('');
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

  // Helper function to reset all form fields
  const resetForm = () => {
    setLinks(['']);
    setIsMoreDetailsOpen(false);
    setPodcastName('');
    setSingleLocationInput('São Paulo, SP, Brazil');
    setCountry('Brazil');
    setState('SP');
    setCity('São Paulo');
    setLanguage('Portuguese');
    setNiche('Tech & AI');
    setSelectedStudioId('not_now');
    setCustomStudioName('');
    setHosts([{ name: '', whatsapp: '', email: '', instagram: '', linkedin: '' }]);
    setProducers([{ name: '', whatsapp: '', email: '', instagram: '', linkedin: '' }]);
    setSubmitterNote('');
  };

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

  // Helper to normalize URL for matching
  const normalizeUrl = (url: string) => {
    return url
      .toLowerCase()
      .trim()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/$/, '');
  };

  // Duplicate checker across podcasts and suggestions
  const duplicatesInfo = useMemo(() => {
    const activeLinks = links.map((l) => l.trim()).filter((l) => l.length > 5);
    if (activeLinks.length === 0) return [];

    const matches: Array<{ link: string; matchedName: string; type: 'podcast' | 'suggestion' }> = [];

    activeLinks.forEach((rawUrl) => {
      const norm = normalizeUrl(rawUrl);
      if (!norm) return;

      // Extract handle or key part if possible
      const handleMatch = norm.match(/@([\w.-]+)/) || norm.match(/instagram\.com\/([\w.-]+)/) || norm.match(/youtube\.com\/([\w.-]+)/);
      const keyToken = handleMatch ? handleMatch[1].toLowerCase() : norm;

      // 1. Check in allPodcasts
      for (const pod of allPodcasts) {
        const podUrls = [pod.youtubeUrl, pod.instagramUrl, pod.tiktokUrl, pod.websiteUrl].filter(Boolean) as string[];
        const isMatch = podUrls.some((u) => {
          const n = normalizeUrl(u);
          return n.includes(keyToken) || norm.includes(n);
        });

        if (isMatch) {
          matches.push({ link: rawUrl, matchedName: pod.name, type: 'podcast' });
          break;
        }
      }

      // 2. Check in existingSuggestions if not found in podcasts
      if (!matches.some((m) => m.link === rawUrl)) {
        for (const sug of existingSuggestions) {
          const sugUrls = [sug.youtubeUrl, sug.instagramUrl, sug.tiktokUrl, sug.websiteUrl].filter(Boolean) as string[];
          const isMatch = sugUrls.some((u) => {
            const n = normalizeUrl(u);
            return n.includes(keyToken) || norm.includes(n);
          });

          if (isMatch) {
            matches.push({ link: rawUrl, matchedName: sug.podcastName, type: 'suggestion' });
            break;
          }
        }
      }
    });

    return matches;
  }, [links, allPodcasts, existingSuggestions]);

  if (!isOpen) return null;

  // Helper to identify platform type
  const getLinkMeta = (url: string) => {
    const u = url.toLowerCase();
    if (u.includes('youtube.com') || u.includes('youtu.be')) {
      return { type: 'youtube', label: 'YouTube', icon: Youtube, color: 'text-rose-500' };
    }
    if (u.includes('instagram.com') || u.includes('instagr.am')) {
      return { type: 'instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-500' };
    }
    if (u.includes('tiktok.com')) {
      return { type: 'tiktok', label: 'TikTok', icon: Video, color: 'text-cyan-400' };
    }
    if (u.includes('spotify.com')) {
      return { type: 'spotify', label: 'Spotify', icon: Music, color: 'text-emerald-400' };
    }
    return { type: 'website', label: 'Website / Link', icon: Globe2, color: 'text-yellow-400' };
  };

  const handleLinkChange = (index: number, value: string) => {
    const updated = [...links];
    updated[index] = value;
    setLinks(updated);
  };

  const handleAddLink = () => {
    setLinks([...links, '']);
  };

  const handleRemoveLink = (index: number) => {
    if (links.length <= 1) return;
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleLocationSelect = (loc: LocationData) => {
    setSingleLocationInput(loc.formattedLocation);
    setCity(loc.city);
    setState(loc.state);
    setCountry(loc.country);
  };

  const handleAddHost = () => {
    setHosts([...hosts, { name: '', whatsapp: '', email: '', instagram: '', linkedin: '' }]);
  };

  const handleRemoveHost = (index: number) => {
    if (hosts.length <= 1) return;
    setHosts(hosts.filter((_, i) => i !== index));
  };

  const handleAddProducer = () => {
    setProducers([...producers, { name: '', whatsapp: '', email: '', instagram: '', linkedin: '' }]);
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

    const validLinks = links.map((l) => l.trim()).filter((l) => l.length > 0);
    if (validLinks.length === 0) return;

    // Classify links into youtube, instagram, tiktok, or website
    let ytUrl = '';
    let igUrl = '';
    let tkUrl = '';
    let webUrl = '';

    validLinks.forEach((url) => {
      const meta = getLinkMeta(url);
      if (meta.type === 'youtube' && !ytUrl) ytUrl = url;
      else if (meta.type === 'instagram' && !igUrl) igUrl = url;
      else if (meta.type === 'tiktok' && !tkUrl) tkUrl = url;
      else if (!webUrl) webUrl = url;
    });

    // Auto-derive Podcast Name if user left it blank
    let derivedName = podcastName.trim();
    if (!derivedName) {
      const primaryUrl = validLinks[0];
      const matchHandle = primaryUrl.match(/@([\w.-]+)/) || primaryUrl.match(/\.com\/([\w.-]+)/);
      if (matchHandle && matchHandle[1]) {
        const cleanHandle = matchHandle[1].replace(/[-_]/g, ' ');
        derivedName = cleanHandle.charAt(0).toUpperCase() + cleanHandle.slice(1);
      } else {
        derivedName = 'Podcast Sugerido';
      }
    }

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
      podcastName: derivedName,
      youtubeUrl: ytUrl,
      instagramUrl: igUrl,
      tiktokUrl: tkUrl,
      websiteUrl: webUrl,
      country: country.trim() || 'Brazil',
      state: state.trim(),
      city: city.trim() || 'Unspecified',
      language: language.trim() || 'Portuguese',
      niche: niche.trim() || 'Tech & AI',
      studioId: selectedStudioId !== 'not_now' ? selectedStudioId : undefined,
      studioName: studioNameResolved,
      hosts: formattedHosts,
      producers: formattedProducers,
      submitterNote: submitterNote.trim()
        ? submitterNote.trim()
        : `Sugerido via links: ${validLinks.join(', ')}`,
    });

    // Reset form fields immediately so it's clean for the next suggestion
    resetForm();
    setSubmittedSuccess(true);
  };

  const handleCloseModal = () => {
    setSubmittedSuccess(false);
    resetForm();
    onClose();
  };

  const hasAtLeastOneLink = links.some((l) => l.trim().length > 3);

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) handleCloseModal();
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

      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl my-8">
        
        {/* Header */}
        <div className="bg-slate-950 p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-yellow-400/10 text-yellow-400 border border-yellow-500/30 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Sugerir um Podcast</h3>
              <p className="text-xs text-slate-400">Insira o link do podcast (YouTube, Instagram, Spotify, etc.)</p>
            </div>
          </div>
          <button
            onClick={handleCloseModal}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form or Success View */}
        {submittedSuccess ? (
          <div className="p-8 text-center space-y-4">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
            <div>
              <h4 className="font-bold text-xl text-white">Obrigado! / Thank You!</h4>
              <p className="text-sm text-slate-300 max-w-md mx-auto mt-1">
                Sua sugestão foi enviada com sucesso para a fila de aprovação!
              </p>
            </div>

            <div className="pt-4 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setSubmittedSuccess(false)}
                className="px-5 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-yellow-500/20 transition active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Sugerir Outro Podcast</span>
              </button>
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
              >
                Fechar
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            
            {/* STEP 1: LINKS SECTION (FAST & SIMPLIFIED) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-yellow-400 flex items-center gap-1.5">
                  <LinkIcon className="w-4 h-4 text-yellow-400" />
                  <span>Link(s) do Podcast / Canal / Perfil <span className="text-rose-400">*</span></span>
                </label>
                <span className="text-[10px] text-slate-400">Obrigatório pelo menos 1 link</span>
              </div>

              <div className="space-y-2.5">
                {links.map((linkVal, idx) => {
                  const meta = getLinkMeta(linkVal);
                  const Icon = meta.icon;

                  return (
                    <div key={idx} className="relative flex items-center gap-2">
                      <div className="relative flex-1">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400">
                          <Icon className={`w-4 h-4 ${linkVal.trim() ? meta.color : 'text-slate-500'}`} />
                        </div>
                        <input
                          type="url"
                          required={idx === 0}
                          placeholder="Ex: https://youtube.com/@flowpodcast ou https://instagram.com/..."
                          value={linkVal}
                          onChange={(e) => handleLinkChange(idx, e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-20 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        />
                        {linkVal.trim().length > 3 && (
                          <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 ${meta.color}`}>
                            {meta.label}
                          </span>
                        )}
                      </div>

                      {links.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveLink(idx)}
                          className="p-2 rounded-xl bg-slate-950 text-slate-500 hover:text-rose-400 border border-slate-800 transition"
                          title="Remover Link"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Add Extra Link Button */}
              <button
                type="button"
                onClick={handleAddLink}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-yellow-400 hover:text-yellow-300 transition py-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar outro link</span>
              </button>

              {/* Duplicate Warning Card */}
              {duplicatesInfo.length > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-950/60 border border-amber-500/50 text-amber-200 text-xs space-y-1.5 animate-in fade-in">
                  <div className="flex items-center gap-2 font-bold text-amber-300">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Atenção: Link já encontrado no banco de dados!</span>
                  </div>
                  {duplicatesInfo.map((dup, dIdx) => (
                    <p key={dIdx} className="text-[11px] text-amber-200/90 pl-6">
                      • O link <span className="font-mono underline text-white">{dup.link}</span> já está registrado como <strong className="text-yellow-300">"{dup.matchedName}"</strong> ({dup.type === 'podcast' ? 'No diretório' : 'Em análise'}).
                    </p>
                  ))}
                </div>
              )}
            </div>

            {/* STEP 2: OPTIONAL COLLAPSIBLE SECTION (EXPAND / COLLAPSE) */}
            <div className="border-t border-slate-800/80 pt-4">
              <button
                type="button"
                onClick={() => setIsMoreDetailsOpen(!isMoreDetailsOpen)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-slate-300 hover:text-white font-bold text-xs flex items-center justify-between transition"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  <span>{isMoreDetailsOpen ? 'Ocultar detalhes adicionais' : '➕ Adicionar mais detalhes (opcional)'}</span>
                </span>
                {isMoreDetailsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {isMoreDetailsOpen && (
                <div className="space-y-4 pt-4 animate-in slide-in-from-top-2 duration-200">
                  
                  {/* Podcast Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1">
                      Nome do Podcast (opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Flow Podcast, Inteligência Ltda, Podpah"
                      value={podcastName}
                      onChange={(e) => setPodcastName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>

                  {/* Niche & Language */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-200 mb-1">Categoria / Categoria</label>
                      <select
                        value={niche}
                        onChange={(e) => setNiche(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      >
                        <option value="Tech & AI">Tech & AI</option>
                        <option value="Business & Entrepreneurship">Business & Entrepreneurship</option>
                        <option value="Comedy">Comedy</option>
                        <option value="Society & Local">Society & Local</option>
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
                        <span>Idioma Principal</span>
                      </label>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      >
                        <option value="Portuguese">Português (Brasil)</option>
                        <option value="English">Inglês</option>
                        <option value="Spanish">Espanhol</option>
                        <option value="Italian">Italiano</option>
                        <option value="French">Francês</option>
                        <option value="German">Alemão</option>
                        <option value="Other">Outro</option>
                      </select>
                    </div>
                  </div>

                  {/* Studio Facility */}
                  <div className="bg-slate-950/70 p-3.5 rounded-xl border border-amber-500/30 space-y-2">
                    <label className="block text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-amber-400" />
                      <span>Estúdio de Gravação</span>
                    </label>

                    <select
                      value={selectedStudioId}
                      onChange={(e) => setSelectedStudioId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    >
                      <option value="not_now">Não listado / Estúdio Próprio / Outro</option>
                      {existingStudios.map((st) => (
                        <option key={st.id} value={st.id}>
                          🏢 {st.name} — {st.city}, {st.country}
                        </option>
                      ))}
                      <option value="custom">✍️ Digitar nome do estúdio...</option>
                    </select>

                    {selectedStudioId === 'custom' && (
                      <input
                        type="text"
                        placeholder="Nome do Estúdio..."
                        value={customStudioName}
                        onChange={(e) => setCustomStudioName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400 mt-2"
                      />
                    )}
                  </div>

                  {/* Location Autocomplete */}
                  <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-2">
                    <label className="block text-xs font-bold text-slate-200 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-rose-400" />
                        <span>Localização (Cidade, Estado, País)</span>
                      </span>
                    </label>

                    <LocationAutocomplete
                      value={singleLocationInput}
                      onChange={handleLocationSelect}
                      placeholder="Digite a cidade e.g. São Paulo, Rio de Janeiro, Milano..."
                    />
                  </div>

                  {/* Hosts */}
                  <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                        <User className="w-4 h-4 text-indigo-400" />
                        <span>Hosts / Apresentadores ({hosts.length})</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddHost}
                        className="px-2 py-1 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-700/50 text-[11px] font-bold flex items-center gap-1 transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Adicionar Host</span>
                      </button>
                    </div>

                    {hosts.map((host, index) => (
                      <div key={index} className="bg-slate-900 p-3 rounded-xl border border-slate-800/80 space-y-2 relative">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-300">Host #{index + 1}</span>
                          {hosts.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveHost(index)}
                              className="text-slate-500 hover:text-rose-400 transition p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            list="suggest-contacts-autocomplete"
                            placeholder="Nome do Host"
                            value={host.name}
                            onChange={(e) => handleHostNameChange(index, e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none"
                          />
                          <input
                            type="text"
                            placeholder="WhatsApp / Telefone"
                            value={host.whatsapp}
                            onChange={(e) => {
                              const updated = [...hosts];
                              updated[index].whatsapp = e.target.value;
                              setHosts(updated);
                            }}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none"
                          />
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
                          <input
                            type="text"
                            placeholder="Instagram (@handle ou link)"
                            value={host.instagram}
                            onChange={(e) => {
                              const updated = [...hosts];
                              updated[index].instagram = e.target.value;
                              setHosts(updated);
                            }}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Producers */}
                  <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                        <Building className="w-4 h-4 text-cyan-400" />
                        <span>Produtores ({producers.length})</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddProducer}
                        className="px-2 py-1 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/50 text-[11px] font-bold flex items-center gap-1 transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Adicionar Produtor</span>
                      </button>
                    </div>

                    {producers.map((producer, index) => (
                      <div key={index} className="bg-slate-900 p-3 rounded-xl border border-slate-800/80 space-y-2 relative">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-300">Produtor #{index + 1}</span>
                          {producers.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveProducer(index)}
                              className="text-slate-500 hover:text-rose-400 transition p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            list="suggest-contacts-autocomplete"
                            placeholder="Nome do Produtor"
                            value={producer.name}
                            onChange={(e) => handleProducerNameChange(index, e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none"
                          />
                          <input
                            type="text"
                            placeholder="WhatsApp / Telefone"
                            value={producer.whatsapp}
                            onChange={(e) => {
                              const updated = [...producers];
                              updated[index].whatsapp = e.target.value;
                              setProducers(updated);
                            }}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none"
                          />
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
                          <input
                            type="text"
                            placeholder="Instagram"
                            value={producer.instagram}
                            onChange={(e) => {
                              const updated = [...producers];
                              updated[index].instagram = e.target.value;
                              setProducers(updated);
                            }}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Note / Message */}
                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1">
                      Observação / Recado para a Equipe
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Algum detalhe adicional que gostaria de nos contar?"
                      value={submitterNote}
                      onChange={(e) => setSubmitterNote(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>

                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="pt-3 flex items-center justify-between border-t border-slate-800/80">
              <span className="text-[11px] text-slate-400">
                {hasAtLeastOneLink ? 'Pronto para enviar!' : 'Preencha o link acima para enviar'}
              </span>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!hasAtLeastOneLink}
                  className={`px-5 py-2 font-extrabold text-xs rounded-xl shadow-lg transition active:scale-95 ${
                    hasAtLeastOneLink
                      ? 'bg-yellow-400 hover:bg-yellow-300 text-black shadow-yellow-500/20 cursor-pointer'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Enviar Sugestão
                </button>
              </div>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};

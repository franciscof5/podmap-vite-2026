import React, { useState, useEffect, useMemo } from 'react';
import { Podcast, CRMStage, ContactPerson } from '../../types';
import { KNOWN_CITY_COORDINATES } from '../../utils/geo';
import { LocationAutocomplete, LocationData } from '../LocationAutocomplete';
import {
  X,
  Youtube,
  MapPin,
  User,
  Building,
  Plus,
  Trash2,
  Building2,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  Globe,
  Sparkles
} from 'lucide-react';

interface PodcastFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (podcast: Podcast) => void;
  editingPodcast: Podcast | null;
  initialStage?: CRMStage;
  existingStudios?: Podcast[];
  allPodcasts?: Podcast[];
}

export const PodcastFormModal: React.FC<PodcastFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingPodcast,
  initialStage = 'notknow',
  existingStudios = [],
  allPodcasts = [],
}) => {
  const [entityType, setEntityType] = useState<'podcast' | 'studio'>('podcast');
  const [studioType, setStudioType] = useState<'podcast' | 'tv' | 'radio' | 'hybrid' | 'production_house'>('podcast');
  const [hourlyRate, setHourlyRate] = useState('');
  const [roomsCount, setRoomsCount] = useState<number>(1);
  const [studioEquipmentText, setStudioEquipmentText] = useState('');
  const [studioServicesText, setStudioServicesText] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [coverImage, setCoverImage] = useState('');

  // Location & Studio Link
  const [singleLocationInput, setSingleLocationInput] = useState('São Paulo, SP, Brazil');
  const [country, setCountry] = useState('Brazil');
  const [state, setState] = useState('SP');
  const [city, setCity] = useState('São Paulo');
  const [latitude, setLatitude] = useState(-23.5505);
  const [longitude, setLongitude] = useState(-46.6333);

  const [selectedStudioId, setSelectedStudioId] = useState<string>('not_now');
  const [customStudioName, setCustomStudioName] = useState<string>('');

  const [language, setLanguage] = useState('Portuguese');
  const [niche, setNiche] = useState('Tech & AI');
  const [stage, setStage] = useState<CRMStage>(initialStage);
  const [rating, setRating] = useState(5);
  const [estimatedAudience, setEstimatedAudience] = useState('100k listeners');

  // Contacts
  const [hosts, setHosts] = useState<ContactPerson[]>([
    { id: 'h1', name: '', email: '', phone: '', whatsapp: '', instagram: '', linkedin: '', role: 'Host' },
  ]);

  const [producers, setProducers] = useState<ContactPerson[]>([
    { id: 'p1', name: '', email: '', phone: '', whatsapp: '', instagram: '', linkedin: '', role: 'Producer' },
  ]);

  // Unique Contacts for Autocomplete
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

  useEffect(() => {
    if (editingPodcast) {
      setEntityType(editingPodcast.entityType || 'podcast');
      setStudioType(editingPodcast.studioType || 'podcast');
      setHourlyRate(editingPodcast.hourlyRate || '');
      setRoomsCount(editingPodcast.roomsCount || 1);
      setStudioEquipmentText(editingPodcast.studioEquipment ? editingPodcast.studioEquipment.join(', ') : '');
      setStudioServicesText(editingPodcast.studioServices ? editingPodcast.studioServices.join(', ') : '');
      setWebsiteUrl(editingPodcast.websiteUrl || '');

      setName(editingPodcast.name);
      setDescription(editingPodcast.description);
      setYoutubeUrl(editingPodcast.youtubeUrl || '');
      setCoverImage(editingPodcast.coverImage);
      setCountry(editingPodcast.country);
      setState(editingPodcast.state || '');
      setCity(editingPodcast.city);
      setSingleLocationInput(`${editingPodcast.city}${editingPodcast.state ? ', ' + editingPodcast.state : ''}, ${editingPodcast.country}`);
      setLatitude(editingPodcast.latitude);
      setLongitude(editingPodcast.longitude);

      setSelectedStudioId(editingPodcast.studioId || (editingPodcast.studioName ? 'custom' : 'not_now'));
      setCustomStudioName(editingPodcast.studioName || '');

      setLanguage(editingPodcast.language || 'Portuguese');
      setNiche(editingPodcast.niche);
      setStage(editingPodcast.stage);
      setRating(editingPodcast.rating || 5);
      setEstimatedAudience(editingPodcast.estimatedAudience || '');
      setHosts(
        editingPodcast.hosts?.length
          ? editingPodcast.hosts
          : [{ id: 'h1', name: '', email: '', phone: '', whatsapp: '', instagram: '', linkedin: '', role: 'Host' }]
      );
      setProducers(
        editingPodcast.producers?.length
          ? editingPodcast.producers
          : [{ id: 'p1', name: '', email: '', phone: '', whatsapp: '', instagram: '', linkedin: '', role: 'Producer' }]
      );
    } else {
      setEntityType('podcast');
      setStudioType('podcast');
      setHourlyRate('');
      setRoomsCount(1);
      setStudioEquipmentText('');
      setStudioServicesText('');
      setWebsiteUrl('');

      setName('');
      setDescription('');
      setYoutubeUrl('');
      setCoverImage('');
      setCountry('Brazil');
      setState('SP');
      setCity('São Paulo');
      setSingleLocationInput('São Paulo, SP, Brazil');
      setLatitude(-23.5505);
      setLongitude(-46.6333);
      setSelectedStudioId('not_now');
      setCustomStudioName('');

      setLanguage('Portuguese');
      setNiche('Tech & AI');
      setStage(initialStage);
      setRating(5);
      setEstimatedAudience('100k subscribers');
      setHosts([{ id: 'h1', name: '', email: '', phone: '', whatsapp: '', instagram: '', linkedin: '', role: 'Host' }]);
      setProducers([{ id: 'p1', name: '', email: '', phone: '', whatsapp: '', instagram: '', linkedin: '', role: 'Producer' }]);
    }
  }, [editingPodcast, initialStage, isOpen]);

  if (!isOpen) return null;

  // Single-line Location Autocomplete Handler
  const handleLocationSelect = (loc: LocationData) => {
    setSingleLocationInput(loc.formattedLocation);
    setCity(loc.city);
    setState(loc.state);
    setCountry(loc.country);
    if (loc.lat && loc.lng) {
      setLatitude(loc.lat);
      setLongitude(loc.lng);
    }
  };

  const handleAutocompleteContact = (nameVal: string, index: number, isHost: boolean) => {
    const match = knownContacts.find((c) => c.name.toLowerCase() === nameVal.toLowerCase().trim());
    if (isHost) {
      const updated = [...hosts];
      updated[index].name = nameVal;
      if (match) {
        if (match.email) updated[index].email = match.email;
        if (match.phone || match.whatsapp) {
          updated[index].phone = match.phone || match.whatsapp || '';
          updated[index].whatsapp = match.whatsapp || match.phone || '';
        }
        if (match.instagram) updated[index].instagram = match.instagram;
        if (match.linkedin) updated[index].linkedin = match.linkedin;
      }
      setHosts(updated);
    } else {
      const updated = [...producers];
      updated[index].name = nameVal;
      if (match) {
        if (match.email) updated[index].email = match.email;
        if (match.phone || match.whatsapp) {
          updated[index].phone = match.phone || match.whatsapp || '';
          updated[index].whatsapp = match.whatsapp || match.phone || '';
        }
        if (match.instagram) updated[index].instagram = match.instagram;
        if (match.linkedin) updated[index].linkedin = match.linkedin;
      }
      setProducers(updated);
    }
  };

  const handleAddHost = () => {
    setHosts([
      ...hosts,
      { id: `h-${Date.now()}`, name: '', email: '', phone: '', whatsapp: '', instagram: '', linkedin: '', role: 'Host' },
    ]);
  };

  const handleRemoveHost = (id: string) => {
    setHosts(hosts.filter((h) => h.id !== id));
  };

  const handleAddProducer = () => {
    setProducers([
      ...producers,
      { id: `p-${Date.now()}`, name: '', email: '', phone: '', whatsapp: '', instagram: '', linkedin: '', role: 'Producer' },
    ]);
  };

  const handleRemoveProducer = (id: string) => {
    setProducers(producers.filter((p) => p.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const defaultCover =
      coverImage.trim() ||
      'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400&auto=format&fit=crop&q=80';

    const equipArray = studioEquipmentText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const srvArray = studioServicesText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    // Resolve studio name
    let studioNameResolved = 'Studio Not Listed / Not Now';
    if (selectedStudioId !== 'not_now' && selectedStudioId !== 'custom') {
      const found = existingStudios.find((s) => s.id === selectedStudioId);
      if (found) studioNameResolved = found.name;
    } else if (selectedStudioId === 'custom' && customStudioName.trim()) {
      studioNameResolved = customStudioName.trim();
    }

    const updatedPodcast: Podcast = {
      id: editingPodcast ? editingPodcast.id : `pod-${Date.now()}`,
      name: name.trim(),
      description: description.trim() || 'No description provided.',
      youtubeUrl: youtubeUrl.trim(),
      coverImage: defaultCover,
      country: country.trim() || 'Brazil',
      state: state.trim(),
      city: city.trim() || 'Unspecified',
      latitude: Number(latitude) || 0,
      longitude: Number(longitude) || 0,
      language: language.trim() || 'Portuguese',
      niche: niche.trim() || 'General',

      studioId: selectedStudioId !== 'not_now' ? selectedStudioId : undefined,
      studioName: studioNameResolved,
      
      entityType,
      studioType: entityType === 'studio' ? studioType : undefined,
      hourlyRate: entityType === 'studio' ? hourlyRate.trim() : undefined,
      roomsCount: entityType === 'studio' ? roomsCount : undefined,
      studioEquipment: entityType === 'studio' ? equipArray : undefined,
      studioServices: entityType === 'studio' ? srvArray : undefined,
      websiteUrl: websiteUrl.trim() || undefined,

      stage,
      rating,
      estimatedAudience: estimatedAudience.trim(),
      hosts: hosts.filter((h) => h.name.trim()),
      producers: producers.filter((p) => p.name.trim()),
      notes: editingPodcast?.notes || [],
      createdAt: editingPodcast ? editingPodcast.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(updatedPodcast);
    onClose();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      {/* Datalist for Hosts / Producers Autocomplete */}
      <datalist id="contacts-autocomplete-list">
        {knownContacts.map((contact, idx) => (
          <option key={idx} value={contact.name}>
            {contact.email ? `${contact.email}` : ''}
          </option>
        ))}
      </datalist>

      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl my-8">
        
        {/* Header */}
        <div className="bg-slate-950 p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg text-white">
              {editingPodcast ? 'Edit CRM Entry' : 'Insert New Entry into CRM'}
            </h3>
            <p className="text-xs text-slate-400">Manage Podcast Channel or Broadcast Studio Facility</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          
          {/* Entity Type Toggle Selector */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
            <span className="text-xs font-bold text-slate-200">Entity Classification:</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEntityType('podcast')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                  entityType === 'podcast'
                    ? 'bg-purple-600 text-white shadow'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                🎙️ Podcast Channel
              </button>
              <button
                type="button"
                onClick={() => setEntityType('studio')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                  entityType === 'studio'
                    ? 'bg-amber-600 text-white shadow'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                🏢 Production Studio
              </button>
            </div>
          </div>

          {/* Stage & Name */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-200 mb-1">
                {entityType === 'studio' ? 'Studio Facility Name' : 'Podcast Title'} <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder={entityType === 'studio' ? 'e.g. Sunset Broadcast Studios' : 'e.g. Flow Podcast, Podpah'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-400 mb-1">
                CRM Pipeline Stage
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as CRMStage)}
                className="w-full bg-amber-950/40 border border-amber-800/60 rounded-xl px-3 py-2 text-xs font-bold text-amber-200 focus:outline-none"
              >
                <option value="notknow">1. Not Known</option>
                <option value="viewed">2. Viewed / Researched</option>
                <option value="contacted">3. Contacted</option>
                <option value="lead">4. Lead / Warm</option>
                <option value="partner">5. Partner</option>
                <option value="customer">6. Customer</option>
                <option value="ex-customer">7. Ex-Customer</option>
              </select>
            </div>
          </div>

          {/* Studio Link Dropdown */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-amber-500/30 space-y-2">
            <label className="block text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>Studio Facility Link</span>
            </label>
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

          {/* Studio Specific Specifications */}
          {entityType === 'studio' && (
            <div className="bg-amber-950/20 border border-amber-800/40 p-4 rounded-xl space-y-3">
              <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <span>Studio Specifications & Rates</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-amber-200 mb-1">Studio Type</label>
                  <select
                    value={studioType}
                    onChange={(e) => setStudioType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-amber-800/60 rounded-xl px-3 py-2 text-xs text-amber-100 focus:outline-none"
                  >
                    <option value="podcast">Podcast Studio</option>
                    <option value="tv">TV / Broadcast Studio</option>
                    <option value="radio">Radio Studio</option>
                    <option value="hybrid">Hybrid (Podcast + TV)</option>
                    <option value="production_house">Production House</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-amber-200 mb-1">Hourly Rate</label>
                  <input
                    type="text"
                    placeholder="e.g. $200/hr, R$ 350/h"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    className="w-full bg-slate-950 border border-amber-800/60 rounded-xl px-3 py-2 text-xs text-amber-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-amber-200 mb-1">Recording Stages / Rooms</label>
                  <input
                    type="number"
                    min={1}
                    value={roomsCount}
                    onChange={(e) => setRoomsCount(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-950 border border-amber-800/60 rounded-xl px-3 py-2 text-xs text-amber-100 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* YouTube Channel & Cover Image */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1 flex items-center gap-1.5">
                <Youtube className="w-4 h-4 text-rose-500" />
                <span>YouTube Channel URL</span>
              </label>
              <input
                type="url"
                placeholder="https://www.youtube.com/@channelname"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">Cover Image URL</label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Niche, Main Language (Select), Est Audience */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">Niche Category</label>
              <select
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                <span>Main Language</span>
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
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

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">Est. Audience / Subs</label>
              <input
                type="text"
                placeholder="e.g. 500k subscribers"
                value={estimatedAudience}
                onChange={(e) => setEstimatedAudience(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Single-line Location Box (Google Maps style) */}
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
            <label className="block text-xs font-bold text-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-rose-400" />
                <span>Location (Google Maps Integration Line)</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">City, State, Country</span>
            </label>

            <LocationAutocomplete
              value={singleLocationInput}
              onChange={handleLocationSelect}
              placeholder="Type a city e.g. New York, Milano, São Paulo..."
            />

            <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1 font-mono">
              <span>City: <strong className="text-white">{city}</strong></span>
              <span>State: <strong className="text-white">{state || 'N/A'}</strong></span>
              <span>Country: <strong className="text-white">{country}</strong></span>
              <span className="ml-auto text-[10px]">Lat: {latitude.toFixed(4)}, Lng: {longitude.toFixed(4)}</span>
            </div>
          </div>

          {/* Dynamic Hosts Contacts */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                <User className="w-4 h-4" />
                <span>Podcast Hosts ({hosts.length})</span>
              </span>
              <button
                type="button"
                onClick={handleAddHost}
                className="px-2.5 py-1 rounded-lg bg-purple-950 hover:bg-purple-900 text-purple-300 text-[11px] font-bold flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Host</span>
              </button>
            </div>

            {hosts.map((host, idx) => (
              <div key={host.id || idx} className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2 relative">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-purple-300">Host #{idx + 1}</span>
                  {hosts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveHost(host.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    list="contacts-autocomplete-list"
                    placeholder="Host Name (Autocomplete)"
                    value={host.name}
                    onChange={(e) => handleAutocompleteContact(e.target.value, idx, true)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                  />
                  <input
                    type="text"
                    placeholder="WhatsApp / Phone"
                    value={host.whatsapp || host.phone}
                    onChange={(e) => {
                      const updated = [...hosts];
                      updated[idx].whatsapp = e.target.value;
                      updated[idx].phone = e.target.value;
                      setHosts(updated);
                    }}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={host.email}
                    onChange={(e) => {
                      const updated = [...hosts];
                      updated[idx].email = e.target.value;
                      setHosts(updated);
                    }}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                  />
                  <input
                    type="text"
                    placeholder="Instagram (@handle or link)"
                    value={host.instagram || ''}
                    onChange={(e) => {
                      const updated = [...hosts];
                      updated[idx].instagram = e.target.value;
                      setHosts(updated);
                    }}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                  />
                  <input
                    type="text"
                    placeholder="LinkedIn URL"
                    value={host.linkedin || ''}
                    onChange={(e) => {
                      const updated = [...hosts];
                      updated[idx].linkedin = e.target.value;
                      setHosts(updated);
                    }}
                    className="sm:col-span-2 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Dynamic Producers Contacts */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                <Building className="w-4 h-4" />
                <span>Producers & Studio Contacts ({producers.length})</span>
              </span>
              <button
                type="button"
                onClick={handleAddProducer}
                className="px-2.5 py-1 rounded-lg bg-indigo-950 hover:bg-indigo-900 text-indigo-300 text-[11px] font-bold flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Producer</span>
              </button>
            </div>

            {producers.map((prod, idx) => (
              <div key={prod.id || idx} className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2 relative">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-indigo-300">Producer #{idx + 1}</span>
                  {producers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveProducer(prod.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    list="contacts-autocomplete-list"
                    placeholder="Producer Name (Autocomplete)"
                    value={prod.name}
                    onChange={(e) => handleAutocompleteContact(e.target.value, idx, false)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                  />
                  <input
                    type="text"
                    placeholder="WhatsApp / Phone"
                    value={prod.whatsapp || prod.phone}
                    onChange={(e) => {
                      const updated = [...producers];
                      updated[idx].whatsapp = e.target.value;
                      updated[idx].phone = e.target.value;
                      setProducers(updated);
                    }}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={prod.email}
                    onChange={(e) => {
                      const updated = [...producers];
                      updated[idx].email = e.target.value;
                      setProducers(updated);
                    }}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                  />
                  <input
                    type="text"
                    placeholder="Instagram (@handle or link)"
                    value={prod.instagram || ''}
                    onChange={(e) => {
                      const updated = [...producers];
                      updated[idx].instagram = e.target.value;
                      setProducers(updated);
                    }}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                  />
                  <input
                    type="text"
                    placeholder="LinkedIn URL"
                    value={prod.linkedin || ''}
                    onChange={(e) => {
                      const updated = [...producers];
                      updated[idx].linkedin = e.target.value;
                      setProducers(updated);
                    }}
                    className="sm:col-span-2 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold text-xs rounded-xl shadow-md transition active:scale-95"
            >
              {editingPodcast ? 'Save Changes' : 'Insert into CRM'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

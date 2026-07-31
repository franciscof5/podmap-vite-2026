import React, { useState, useEffect } from 'react';
import { Podcast, CRMStage, ContactPerson } from '../../types';
import { KNOWN_CITY_COORDINATES } from '../../utils/geo';
import { X, Youtube, MapPin, User, Building, Plus, Trash2, Wand2 } from 'lucide-react';

interface PodcastFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (podcast: Podcast) => void;
  editingPodcast: Podcast | null;
  initialStage?: CRMStage;
}

export const PodcastFormModal: React.FC<PodcastFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingPodcast,
  initialStage = 'notknow',
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [country, setCountry] = useState('USA');
  const [state, setState] = useState('');
  const [city, setCity] = useState('Austin');
  const [latitude, setLatitude] = useState(30.2672);
  const [longitude, setLongitude] = useState(-97.7431);
  const [language, setLanguage] = useState('English');
  const [niche, setNiche] = useState('Tech & AI');
  const [stage, setStage] = useState<CRMStage>(initialStage);
  const [rating, setRating] = useState(5);
  const [estimatedAudience, setEstimatedAudience] = useState('100k listeners');

  const [hosts, setHosts] = useState<ContactPerson[]>([
    { id: 'h1', name: '', email: '', phone: '', role: 'Main Host' },
  ]);

  const [producers, setProducers] = useState<ContactPerson[]>([
    { id: 'p1', name: '', email: '', phone: '', role: 'Producer' },
  ]);

  useEffect(() => {
    if (editingPodcast) {
      setName(editingPodcast.name);
      setDescription(editingPodcast.description);
      setYoutubeUrl(editingPodcast.youtubeUrl);
      setCoverImage(editingPodcast.coverImage);
      setCountry(editingPodcast.country);
      setState(editingPodcast.state || '');
      setCity(editingPodcast.city);
      setLatitude(editingPodcast.latitude);
      setLongitude(editingPodcast.longitude);
      setLanguage(editingPodcast.language);
      setNiche(editingPodcast.niche);
      setStage(editingPodcast.stage);
      setRating(editingPodcast.rating || 5);
      setEstimatedAudience(editingPodcast.estimatedAudience || '');
      setHosts(
        editingPodcast.hosts?.length
          ? editingPodcast.hosts
          : [{ id: 'h1', name: '', email: '', phone: '', role: 'Main Host' }]
      );
      setProducers(
        editingPodcast.producers?.length
          ? editingPodcast.producers
          : [{ id: 'p1', name: '', email: '', phone: '', role: 'Producer' }]
      );
    } else {
      setName('');
      setDescription('');
      setYoutubeUrl('');
      setCoverImage('');
      setCountry('USA');
      setState('');
      setCity('Austin');
      setLatitude(30.2672);
      setLongitude(-97.7431);
      setLanguage('English');
      setNiche('Tech & AI');
      setStage(initialStage);
      setRating(5);
      setEstimatedAudience('100k subscribers');
      setHosts([{ id: 'h1', name: '', email: '', phone: '', role: 'Main Host' }]);
      setProducers([{ id: 'p1', name: '', email: '', phone: '', role: 'Producer' }]);
    }
  }, [editingPodcast, initialStage, isOpen]);

  if (!isOpen) return null;

  // Auto Lookup Coordinates when typing City
  const handleCityLookup = (cityName: string) => {
    setCity(cityName);
    const known = KNOWN_CITY_COORDINATES[cityName];
    if (known) {
      setLatitude(known.lat);
      setLongitude(known.lng);
      setCountry(known.country);
    }
  };

  const handleAddHost = () => {
    setHosts([
      ...hosts,
      { id: `h-${Date.now()}`, name: '', email: '', phone: '', role: 'Co-Host' },
    ]);
  };

  const handleRemoveHost = (id: string) => {
    setHosts(hosts.filter((h) => h.id !== id));
  };

  const handleAddProducer = () => {
    setProducers([
      ...producers,
      { id: `p-${Date.now()}`, name: '', email: '', phone: '', role: 'Producer' },
    ]);
  };

  const handleRemoveProducer = (id: string) => {
    setProducers(producers.filter((p) => p.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !youtubeUrl.trim()) return;

    const defaultCover =
      coverImage.trim() ||
      'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400&auto=format&fit=crop&q=80';

    const updatedPodcast: Podcast = {
      id: editingPodcast ? editingPodcast.id : `pod-${Date.now()}`,
      name: name.trim(),
      description: description.trim() || 'No description provided.',
      youtubeUrl: youtubeUrl.trim(),
      coverImage: defaultCover,
      country: country.trim() || 'USA',
      state: state.trim(),
      city: city.trim() || 'Unspecified',
      latitude: Number(latitude) || 0,
      longitude: Number(longitude) || 0,
      language: language.trim() || 'English',
      niche: niche.trim() || 'General',
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
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
        
        {/* Header */}
        <div className="bg-slate-950 p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg text-white">
              {editingPodcast ? 'Edit Podcast CRM Entry' : 'Insert New Podcast into CRM'}
            </h3>
            <p className="text-xs text-slate-400">Manage pipeline stage, coordinates, and contact details</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Stage & Name */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-200 mb-1">
                Podcast Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. The Joe Rogan Experience"
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

          {/* YouTube Channel URL & Cover */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1 flex items-center gap-1.5">
                <Youtube className="w-4 h-4 text-rose-500" />
                <span>YouTube Channel URL <span className="text-rose-400">*</span></span>
              </label>
              <input
                type="url"
                required
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

          {/* Niche, Language, Audience */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">Niche Category</label>
              <input
                type="text"
                placeholder="e.g. Tech & AI, Comedy, Business"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">Language</label>
              <input
                type="text"
                placeholder="e.g. English, Portuguese"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
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

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-200 mb-1">Description / Summary</label>
            <textarea
              rows={2}
              placeholder="Brief summary of the podcast topics..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Location & Map Coordinates Box */}
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-rose-400" />
                <span>Studio Location & Map Coordinates</span>
              </span>
              <span className="text-[10px] text-slate-500">Auto-sets lat/lng for known cities</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-0.5">City</label>
                <input
                  type="text"
                  placeholder="e.g. Austin, São Paulo, Tokyo"
                  value={city}
                  onChange={(e) => handleCityLookup(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-0.5">State</label>
                <input
                  type="text"
                  placeholder="e.g. Texas, SP"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-0.5">Country</label>
                <input
                  type="text"
                  placeholder="e.g. USA, Brazil, Japan"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <label className="block text-[10px] text-slate-500 font-mono">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 font-mono focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 font-mono">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 font-mono focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Dynamic Hosts Contacts */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                <User className="w-4 h-4" />
                <span>Podcast Hosts</span>
              </span>
              <button
                type="button"
                onClick={handleAddHost}
                className="text-xs text-purple-300 hover:underline flex items-center gap-1 font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Host</span>
              </button>
            </div>

            {hosts.map((host, idx) => (
              <div key={host.id} className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                <input
                  type="text"
                  placeholder="Host Name"
                  value={host.name}
                  onChange={(e) => {
                    const newHosts = [...hosts];
                    newHosts[idx].name = e.target.value;
                    setHosts(newHosts);
                  }}
                  className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-100"
                />
                <input
                  type="email"
                  placeholder="Host Email"
                  value={host.email}
                  onChange={(e) => {
                    const newHosts = [...hosts];
                    newHosts[idx].email = e.target.value;
                    setHosts(newHosts);
                  }}
                  className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-100"
                />
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    placeholder="Phone"
                    value={host.phone}
                    onChange={(e) => {
                      const newHosts = [...hosts];
                      newHosts[idx].phone = e.target.value;
                      setHosts(newHosts);
                    }}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-100"
                  />
                  {hosts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveHost(host.id)}
                      className="p-1 text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Dynamic Producers Contacts */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                <Building className="w-4 h-4" />
                <span>Producers & Studio Contact</span>
              </span>
              <button
                type="button"
                onClick={handleAddProducer}
                className="text-xs text-indigo-300 hover:underline flex items-center gap-1 font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Producer</span>
              </button>
            </div>

            {producers.map((prod, idx) => (
              <div key={prod.id} className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                <input
                  type="text"
                  placeholder="Producer Name"
                  value={prod.name}
                  onChange={(e) => {
                    const newProds = [...producers];
                    newProds[idx].name = e.target.value;
                    setProducers(newProds);
                  }}
                  className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-100"
                />
                <input
                  type="email"
                  placeholder="Producer Email"
                  value={prod.email}
                  onChange={(e) => {
                    const newProds = [...producers];
                    newProds[idx].email = e.target.value;
                    setProducers(newProds);
                  }}
                  className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-100"
                />
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    placeholder="Phone"
                    value={prod.phone}
                    onChange={(e) => {
                      const newProds = [...producers];
                      newProds[idx].phone = e.target.value;
                      setProducers(newProds);
                    }}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-100"
                  />
                  {producers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveProducer(prod.id)}
                      className="p-1 text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
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
              className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl shadow-md transition"
            >
              {editingPodcast ? 'Save Changes' : 'Insert into CRM'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

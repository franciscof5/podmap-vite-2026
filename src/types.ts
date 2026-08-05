export type CRMStage =
  | 'notknow'
  | 'viewed'
  | 'contacted'
  | 'lead'
  | 'partner'
  | 'customer'
  | 'ex-customer';

export type EntityType = 'podcast' | 'studio';

export type StudioType = 'podcast' | 'tv' | 'radio' | 'hybrid' | 'production_house';

export interface ContactPerson {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  role?: string;
  instagram?: string;
  linkedin?: string;
}

export interface ActivityNote {
  id: string;
  date: string;
  author: string;
  text: string;
}

export interface Podcast {
  id: string;
  name: string;
  description: string;
  youtubeUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  youtubeChannelId?: string;
  coverImage: string;
  country: string;
  state: string;
  city: string;
  latitude: number;
  longitude: number;
  language: string;
  niche: string; // e.g. 'Tech & AI', 'Business', 'Comedy', 'Health & Fitness', 'True Crime', 'Education', 'Pop Culture'
  
  // Studio Link & Location vs Target Location
  studioId?: string; // linked studio ID from database if recorded at a registered studio
  studioName?: string; // name of studio or 'Not in a studio / Not now'

  // Entity Type & Studio-specific features
  entityType?: EntityType; // 'podcast' | 'studio' (defaults to 'podcast')
  studioType?: StudioType; // 'podcast' | 'tv' | 'radio' | 'hybrid' | 'production_house'
  studioEquipment?: string[]; // e.g. ['4K Cameras', 'Blackmagic Switcher', 'Acoustic Panels']
  studioServices?: string[]; // e.g. ['Live Stream', 'Video Editing', 'Set Building']
  hourlyRate?: string; // e.g. '$150/hr', 'R$ 350/h'
  roomsCount?: number; // e.g. 3
  websiteUrl?: string; // e.g. 'https://flowstudios.com'

  producers: ContactPerson[];
  hosts: ContactPerson[];
  stage: CRMStage;
  notes?: ActivityNote[];
  rating?: number; // 1 to 5
  estimatedAudience?: string; // e.g. "50k-100k listeners"
  createdAt: string;
  updatedAt: string;
  suggestedBy?: string; // if from public submission
}

export interface PodcastSuggestion {
  id: string;
  podcastName: string;
  youtubeUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  country: string;
  state: string;
  city: string;
  language: string;
  niche: string;

  studioId?: string;
  studioName?: string;

  entityType?: EntityType;
  studioType?: StudioType;
  websiteUrl?: string;
  equipmentSummary?: string;

  producers: ContactPerson[];
  hosts: ContactPerson[];
  submittedByEmail?: string;
  submitterNote?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface FilterState {
  searchQuery: string;
  entityType: 'all' | 'podcast' | 'studio';
  studioType: string; // '' for all, or 'podcast', 'tv', 'radio', 'hybrid', 'production_house'
  niche: string;
  language: string;
  country: string;
  stage: string; // for admin filtering
  sortBy: 'distance' | 'name' | 'rating' | 'newest';
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  cityName?: string;
  countryName?: string;
  isCustomOrDetected: boolean;
}

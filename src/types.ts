export type CRMStage =
  | 'notknow'
  | 'viewed'
  | 'contacted'
  | 'lead'
  | 'partner'
  | 'customer'
  | 'ex-customer';

export interface ContactPerson {
  id: string;
  name: string;
  email: string;
  phone: string;
  role?: string;
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
  youtubeUrl: string;
  youtubeChannelId?: string;
  coverImage: string;
  country: string;
  state: string;
  city: string;
  latitude: number;
  longitude: number;
  language: string;
  niche: string; // e.g. 'Tech & AI', 'Business', 'Comedy', 'Health & Fitness', 'True Crime', 'Education', 'Pop Culture'
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
  youtubeUrl: string;
  country: string;
  state: string;
  city: string;
  language: string;
  niche: string;
  producers: ContactPerson[];
  hosts: ContactPerson[];
  submittedByEmail?: string;
  submitterNote?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface FilterState {
  searchQuery: string;
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

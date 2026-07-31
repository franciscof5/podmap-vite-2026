import { Podcast, PodcastSuggestion } from '../types';
import { INITIAL_PODCASTS, INITIAL_SUGGESTIONS } from '../data/initialData';

const PODCASTS_KEY = 'podcast_map_crm_podcasts_v1';
const SUGGESTIONS_KEY = 'podcast_map_crm_suggestions_v1';
const ADMIN_PIN_KEY = 'podcast_map_crm_admin_pin_v1';

export function getStoredPodcasts(): Podcast[] {
  try {
    const raw = localStorage.getItem(PODCASTS_KEY);
    if (!raw) {
      savePodcasts(INITIAL_PODCASTS);
      return INITIAL_PODCASTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load podcasts from localStorage', err);
    return INITIAL_PODCASTS;
  }
}

export function savePodcasts(podcasts: Podcast[]): void {
  try {
    localStorage.setItem(PODCASTS_KEY, JSON.stringify(podcasts));
  } catch (err) {
    console.error('Failed to save podcasts to localStorage', err);
  }
}

export function getStoredSuggestions(): PodcastSuggestion[] {
  try {
    const raw = localStorage.getItem(SUGGESTIONS_KEY);
    if (!raw) {
      saveSuggestions(INITIAL_SUGGESTIONS);
      return INITIAL_SUGGESTIONS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load suggestions from localStorage', err);
    return INITIAL_SUGGESTIONS;
  }
}

export function saveSuggestions(suggestions: PodcastSuggestion[]): void {
  try {
    localStorage.setItem(SUGGESTIONS_KEY, JSON.stringify(suggestions));
  } catch (err) {
    console.error('Failed to save suggestions to localStorage', err);
  }
}

export function getAdminPin(): string {
  try {
    return localStorage.getItem(ADMIN_PIN_KEY) || '1234';
  } catch (err) {
    return '1234';
  }
}

export function setAdminPin(pin: string): void {
  try {
    localStorage.setItem(ADMIN_PIN_KEY, pin);
  } catch (err) {
    console.error('Failed to update admin pin', err);
  }
}

export function resetToSeedData(): { podcasts: Podcast[]; suggestions: PodcastSuggestion[] } {
  savePodcasts(INITIAL_PODCASTS);
  saveSuggestions(INITIAL_SUGGESTIONS);
  return { podcasts: INITIAL_PODCASTS, suggestions: INITIAL_SUGGESTIONS };
}

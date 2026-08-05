import { Podcast, PodcastSuggestion } from '../types';
import { INITIAL_PODCASTS, INITIAL_SUGGESTIONS } from '../data/initialData';
import {
  fetchPodcastsFromPB,
  savePodcastToPB,
  deletePodcastFromPB,
  bulkSavePodcastsToPB,
  fetchSuggestionsFromPB,
  saveSuggestionToPB,
  deleteSuggestionFromPB,
  bulkSaveSuggestionsToPB,
  seedPocketBaseDirectly,
} from './pocketbase';

const PODCASTS_KEY = 'podcast_map_crm_podcasts_v1';
const SUGGESTIONS_KEY = 'podcast_map_crm_suggestions_v1';
const ADMIN_PIN_KEY = 'podcast_map_crm_admin_pin_v1';

export function getStoredPodcasts(): Podcast[] {
  try {
    const raw = localStorage.getItem(PODCASTS_KEY);
    if (!raw) {
      savePodcasts(INITIAL_PODCASTS);
      // Seed initial data to PocketBase in background
      seedPocketBaseDirectly(INITIAL_PODCASTS, INITIAL_SUGGESTIONS);
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

/**
 * Async fetch podcasts from PocketBase, returning whether PocketBase holds data
 */
export async function loadPodcastsWithPB(): Promise<{ podcasts: Podcast[]; isFromPB: boolean }> {
  const local = getStoredPodcasts();
  const pbData = await fetchPodcastsFromPB();

  if (pbData && pbData.length > 0) {
    // Merge PocketBase and local records by ID so local-only items are never lost
    const pbIds = new Set(pbData.map((p) => p.id));
    const localOnly = local.filter((p) => !pbIds.has(p.id));
    const merged = [...pbData, ...localOnly];

    // Background sync any local-only items to PocketBase
    localOnly.forEach((p) => {
      savePodcastToPB(p).catch(() => {});
    });

    savePodcasts(merged);
    return { podcasts: merged, isFromPB: true };
  }
  // PocketBase is empty or unavailable, fallback to local storage
  return { podcasts: local, isFromPB: false };
}

/**
 * Save single podcast to local & PocketBase
 */
export async function saveSinglePodcast(podcast: Podcast, allPodcasts: Podcast[]): Promise<Podcast[]> {
  const exists = allPodcasts.some((p) => p.id === podcast.id);
  const updatedList = exists
    ? allPodcasts.map((p) => (p.id === podcast.id ? podcast : p))
    : [podcast, ...allPodcasts];

  savePodcasts(updatedList);
  savePodcastToPB(podcast);
  return updatedList;
}

/**
 * Delete podcast from local & PocketBase
 */
export async function deleteSinglePodcast(podcastId: string, allPodcasts: Podcast[]): Promise<Podcast[]> {
  const updatedList = allPodcasts.filter((p) => p.id !== podcastId);
  savePodcasts(updatedList);
  deletePodcastFromPB(podcastId);
  return updatedList;
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

/**
 * Async fetch suggestions from PocketBase
 */
export async function loadSuggestionsWithPB(): Promise<PodcastSuggestion[]> {
  const local = getStoredSuggestions();
  const pbData = await fetchSuggestionsFromPB();

  if (pbData && pbData.length > 0) {
    // Merge PocketBase and local suggestions by ID so local-only suggestions are never lost
    const pbIds = new Set(pbData.map((s) => s.id));
    const localOnly = local.filter((s) => !pbIds.has(s.id));
    const merged = [...pbData, ...localOnly];

    // Background sync any local-only items to PocketBase
    localOnly.forEach((s) => {
      saveSuggestionToPB(s).catch(() => {});
    });

    saveSuggestions(merged);
    return merged;
  }
  return local;
}

/**
 * Save single suggestion to local & PocketBase
 */
export async function saveSingleSuggestion(
  suggestion: PodcastSuggestion,
  allSuggestions: PodcastSuggestion[]
): Promise<PodcastSuggestion[]> {
  const exists = allSuggestions.some((s) => s.id === suggestion.id);
  const updatedList = exists
    ? allSuggestions.map((s) => (s.id === suggestion.id ? suggestion : s))
    : [suggestion, ...allSuggestions];

  saveSuggestions(updatedList);
  saveSuggestionToPB(suggestion);
  return updatedList;
}

/**
 * Delete suggestion from local & PocketBase
 */
export async function deleteSingleSuggestion(
  suggestionId: string,
  allSuggestions: PodcastSuggestion[]
): Promise<PodcastSuggestion[]> {
  const updatedList = allSuggestions.filter((s) => s.id !== suggestionId);
  saveSuggestions(updatedList);
  deleteSuggestionFromPB(suggestionId);
  return updatedList;
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
  seedPocketBaseDirectly(INITIAL_PODCASTS, INITIAL_SUGGESTIONS);
  return { podcasts: INITIAL_PODCASTS, suggestions: INITIAL_SUGGESTIONS };
}

export async function resetToSeedDataAndSyncPB(): Promise<{
  podcasts: Podcast[];
  suggestions: PodcastSuggestion[];
  pbResult: { success: boolean; podcastsSaved: number; suggestionsSaved: number; message: string };
}> {
  savePodcasts(INITIAL_PODCASTS);
  saveSuggestions(INITIAL_SUGGESTIONS);
  const pbResult = await seedPocketBaseDirectly(INITIAL_PODCASTS, INITIAL_SUGGESTIONS);
  return { podcasts: INITIAL_PODCASTS, suggestions: INITIAL_SUGGESTIONS, pbResult };
}


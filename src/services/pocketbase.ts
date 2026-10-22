import PocketBase from 'pocketbase';
import { Podcast, PodcastSuggestion } from '../types';

let isAuthenticated = false;
let lastAuthErrorMessage = '';

export function getPbCredentials() {
  const customEmail = localStorage.getItem('pb_admin_email');
  const customPassword = localStorage.getItem('pb_admin_password');
  let customUrl = localStorage.getItem('pb_url');

  if (customUrl && customUrl.includes('f5sites.com.br')) {
    customUrl = customUrl.replace('f5sites.com.br', 'f5sites.com');
    localStorage.setItem('pb_url', customUrl);
  }

  return {
    email: customEmail || (import.meta as any).env?.VITE_POCKETBASE_ADMIN_EMAIL || 'francisco@f5sites.com',
    password: customPassword || (import.meta as any).env?.VITE_POCKETBASE_ADMIN_PASSWORD || 'ehcampeao@123',
    url: customUrl || (import.meta as any).env?.VITE_POCKETBASE_URL || 'https://pocket.f5sites.com',
  };
}

export function savePbCredentials(email: string, pass: string, url?: string) {
  if (email) localStorage.setItem('pb_admin_email', email);
  if (pass) localStorage.setItem('pb_admin_password', pass);
  if (url) localStorage.setItem('pb_url', url);
  isAuthenticated = false;
}

export const POCKETBASE_URL = getPbCredentials().url;
export const pb = new PocketBase(POCKETBASE_URL);
pb.autoCancellation(false);

/**
 * Authenticate with PocketBase as admin/superuser to allow collection operations
 */
export async function authenticateAdmin(): Promise<boolean> {
  const creds = getPbCredentials();
  const email = creds.email;
  const password = creds.password;

  const primaryUrl = creds.url.replace(/\/+$/, '');
  const alternateUrl = primaryUrl.startsWith('https://')
    ? primaryUrl.replace('https://', 'http://')
    : primaryUrl.replace('http://', 'https://');

  const urlsToTry = [primaryUrl];
  if (alternateUrl !== primaryUrl) {
    urlsToTry.push(alternateUrl);
  }

  let errors: string[] = [];

  for (const targetUrl of urlsToTry) {
    pb.baseUrl = targetUrl;

    // Try 1: Direct fetch to _superusers endpoint with identity payload (matches PB v0.22+)
    try {
      const res = await fetch(`${targetUrl}/api/collections/_superusers/auth-with-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity: email, password }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.token) {
          pb.authStore.save(data.token, data.record);
          isAuthenticated = true;
          lastAuthErrorMessage = '';
          return true;
        }
      } else {
        const errJson = await res.json().catch(() => ({}));
        errors.push(`${targetUrl} (_superusers HTTP ${res.status}): ${errJson?.message || res.statusText}`);
      }
    } catch (err: any) {
      errors.push(`${targetUrl} (_superusers fetch error): ${err?.message || String(err)}`);
    }

    // Try 2: SDK authWithPassword on _superusers
    try {
      await pb.collection('_superusers').authWithPassword(email, password);
      isAuthenticated = true;
      lastAuthErrorMessage = '';
      return true;
    } catch (err: any) {
      errors.push(`${targetUrl} (_superusers SDK): ${err?.message || String(err)}`);
    }

    // Try 3: Legacy admins endpoint via fetch
    try {
      const res = await fetch(`${targetUrl}/api/admins/auth-with-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity: email, email, password }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.token) {
          pb.authStore.save(data.token, data.admin || data.record);
          isAuthenticated = true;
          lastAuthErrorMessage = '';
          return true;
        }
      }
    } catch (err: any) {
      errors.push(`${targetUrl} (admins fetch error): ${err?.message || String(err)}`);
    }

    // Try 4: Legacy SDK admins auth
    try {
      await pb.admins.authWithPassword(email, password);
      isAuthenticated = true;
      lastAuthErrorMessage = '';
      return true;
    } catch (err: any) {
      errors.push(`${targetUrl} (admins SDK): ${err?.message || String(err)}`);
    }
  }

  lastAuthErrorMessage = `Auth failed for '${email}'. Details: ${errors.join(' | ')}`;
  console.warn('PocketBase admin authentication failed:', lastAuthErrorMessage);
  return false;
}

/**
 * Ensure PocketBase collections 'podmap_podcasts' and 'sponsor_suggestions' exist, or create/update them via REST API
 */
const PODCAST_COLLECTION_FIELDS = [
  { name: 'original_id', type: 'text' },
  { name: 'name', type: 'text', required: true },
  { name: 'description', type: 'text' },
  { name: 'youtubeUrl', type: 'text' },
  { name: 'youtubeChannelId', type: 'text' },
  { name: 'coverImage', type: 'text' },
  { name: 'websiteUrl', type: 'text' },
  { name: 'country', type: 'text' },
  { name: 'state', type: 'text' },
  { name: 'city', type: 'text' },
  { name: 'latitude', type: 'number' },
  { name: 'longitude', type: 'number' },
  { name: 'language', type: 'text' },
  { name: 'niche', type: 'text' },
  { name: 'entityType', type: 'text' },
  { name: 'studioType', type: 'text' },
  { name: 'hourlyRate', type: 'text' },
  { name: 'roomsCount', type: 'number' },
  { name: 'studioEquipment', type: 'json' },
  { name: 'studioServices', type: 'json' },
  { name: 'producers', type: 'json' },
  { name: 'hosts', type: 'json' },
  { name: 'stage', type: 'text' },
  { name: 'notes', type: 'json' },
  { name: 'rating', type: 'number' },
  { name: 'estimatedAudience', type: 'text' },
  { name: 'createdAt', type: 'text' },
];

const SUGGESTION_COLLECTION_FIELDS = [
  { name: 'original_id', type: 'text' },
  { name: 'name', type: 'text', required: true },
  { name: 'youtubeUrl', type: 'text' },
  { name: 'instagramUrl', type: 'text' },
  { name: 'tiktokUrl', type: 'text' },
  { name: 'studioId', type: 'text' },
  { name: 'studioName', type: 'text' },
  { name: 'description', type: 'text' },
  { name: 'coverImage', type: 'text' },
  { name: 'country', type: 'text' },
  { name: 'state', type: 'text' },
  { name: 'city', type: 'text' },
  { name: 'latitude', type: 'number' },
  { name: 'longitude', type: 'number' },
  { name: 'language', type: 'text' },
  { name: 'niche', type: 'text' },
  { name: 'entityType', type: 'text' },
  { name: 'studioType', type: 'text' },
  { name: 'websiteUrl', type: 'text' },
  { name: 'equipmentSummary', type: 'text' },
  { name: 'producers', type: 'json' },
  { name: 'hosts', type: 'json' },
  { name: 'submittedByEmail', type: 'text' },
  { name: 'status', type: 'text' },
  { name: 'createdAt', type: 'text' },
];

let isCollectionsEnsured = false;

async function createOrEnsureCollection(name: string, fields: any[]): Promise<void> {
  const token = pb.authStore.token;
  
  let collectionExists = false;
  try {
    await pb.collections.getOne(name);
    collectionExists = true;
  } catch {
    collectionExists = false;
  }

  if (collectionExists) {
    try {
      const col = await pb.collections.getOne(name);
      await pb.collections.update(col.id, {
        fields,
        schema: fields,
        listRule: '',
        viewRule: '',
        createRule: '',
        updateRule: '',
        deleteRule: '',
      }).catch((e) => console.log(`Note updating ${name} collection:`, e?.message));
    } catch (e: any) {
      console.warn(`Note on updating collection ${name}:`, e?.message);
    }
    return;
  }

  console.log(`Creating collection '${name}' in PocketBase...`);
  let createSuccess = false;
  let lastError: any = null;

  try {
    await pb.collections.create({
      name,
      type: 'base',
      fields,
      schema: fields,
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: '',
    });
    createSuccess = true;
  } catch (err: any) {
    lastError = err;
    console.warn(`SDK creation failed for '${name}', trying REST API fallback:`, err?.message);
  }

  if (!createSuccess) {
    try {
      const resp = await fetch(`${POCKETBASE_URL}/api/collections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : (pb.authStore.token ? `Bearer ${pb.authStore.token}` : ''),
        },
        body: JSON.stringify({
          name,
          type: 'base',
          fields,
          schema: fields,
          listRule: '',
          viewRule: '',
          createRule: '',
          updateRule: '',
          deleteRule: '',
        }),
      });

      if (resp.ok || resp.status === 400 || resp.status === 409) {
        createSuccess = true;
      } else {
        const errorJson = await resp.json().catch(() => ({}));
        throw new Error(errorJson?.message || `HTTP ${resp.status}: ${resp.statusText}`);
      }
    } catch (err2: any) {
      throw new Error(`Could not create PocketBase collection '${name}': ${lastError?.message || err2?.message || String(err2)}`);
    }
  }
}

export async function ensureCollectionsExist(force = false): Promise<void> {
  if (isCollectionsEnsured && !force) return;
  const authed = await authenticateAdmin();
  if (!authed) {
    throw new Error('PocketBase Admin authentication failed. Check credentials or network.');
  }

  await createOrEnsureCollection('podmap_podcasts', PODCAST_COLLECTION_FIELDS);
  await createOrEnsureCollection('sponsor_suggestions', SUGGESTION_COLLECTION_FIELDS);
  isCollectionsEnsured = true;
}

/**
 * Explicitly seed PocketBase database with podcasts and suggestions
 */
export async function seedPocketBaseDirectly(
  podcasts: Podcast[],
  suggestions: PodcastSuggestion[]
): Promise<{ success: boolean; podcastsSaved: number; suggestionsSaved: number; message: string }> {
  try {
    const authed = await authenticateAdmin();
    if (!authed) {
      return {
        success: false,
        podcastsSaved: 0,
        suggestionsSaved: 0,
        message: 'PocketBase admin authentication failed. Please verify credentials (pocket.f5sites.com.br).',
      };
    }

    await ensureCollectionsExist(true);

    let podcastCount = 0;
    const podcastErrors: string[] = [];

    for (const podcast of podcasts) {
      try {
        const ok = await savePodcastToPB(podcast);
        if (ok) podcastCount++;
      } catch (err: any) {
        podcastErrors.push(`${podcast.name}: ${err?.message || String(err)}`);
      }
    }

    let suggestionCount = 0;
    for (const sug of suggestions) {
      try {
        const ok = await saveSuggestionToPB(sug);
        if (ok) suggestionCount++;
      } catch {}
    }

    if (podcastCount === 0 && podcasts.length > 0) {
      return {
        success: false,
        podcastsSaved: 0,
        suggestionsSaved: suggestionCount,
        message: `Seed failed. PocketBase error: ${podcastErrors[0] || 'Unknown error creating records'}`,
      };
    }

    return {
      success: true,
      podcastsSaved: podcastCount,
      suggestionsSaved: suggestionCount,
      message: `PocketBase database successfully seeded! ${podcastCount} podcasts/studios saved to pocket.f5sites.com.br`,
    };
  } catch (err: any) {
    console.error('PocketBase seed error:', err);
    return {
      success: false,
      podcastsSaved: 0,
      suggestionsSaved: 0,
      message: `Failed to seed PocketBase: ${err?.message || String(err)}`,
    };
  }
}

/**
 * Fetch all podcasts from PocketBase
 */
export async function fetchPodcastsFromPB(): Promise<Podcast[] | null> {
  const creds = getPbCredentials();
  const baseUrl = creds.url.replace(/\/+$/, '');

  let records: any[] = [];
  
  // Helper to fetch records with fallback sorting
  const tryGetRecords = async (sortField: string) => {
    try {
      pb.baseUrl = baseUrl;
      return await pb.collection('podmap_podcasts').getFullList({
        sort: sortField,
        requestKey: null,
      });
    } catch {
      const res = await fetch(`${baseUrl}/api/collections/podmap_podcasts/records?page=1&perPage=1000&skipTotal=1${sortField ? `&sort=${sortField}` : ''}`, {
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (res.ok) {
        const data = await res.json();
        return data.items || [];
      }
      throw new Error(`Direct fetch status ${res.status}`);
    }
  };

  try {
    try {
      records = await tryGetRecords('-createdAt');
    } catch {
      try {
        records = await tryGetRecords('-created');
      } catch {
        records = await tryGetRecords('');
      }
    }
  } catch (err1) {
    try {
      await authenticateAdmin();
      try {
        records = await pb.collection('podmap_podcasts').getFullList({ sort: '-createdAt', requestKey: null });
      } catch {
        records = await pb.collection('podmap_podcasts').getFullList({ sort: '-created', requestKey: null });
      }
    } catch (err3) {
      console.warn('Failed to fetch podcasts from PocketBase:', err3);
      return null;
    }
  }

  if (!records || records.length === 0) {
    return null;
  }

  return records.map((r: any) => ({
    id: r.original_id || r.id,
    name: r.name || '',
    description: r.description || '',
    youtubeUrl: r.youtubeUrl || '',
    youtubeChannelId: r.youtubeChannelId || '',
    coverImage: r.coverImage || '',
    websiteUrl: r.websiteUrl || undefined,
    country: r.country || '',
    state: r.state || '',
    city: r.city || '',
    latitude: Number(r.latitude) || 0,
    longitude: Number(r.longitude) || 0,
    language: r.language || '',
    niche: r.niche || '',
    entityType: r.entityType as any,
    studioType: r.studioType as any,
    hourlyRate: r.hourlyRate || undefined,
    roomsCount: r.roomsCount ? Number(r.roomsCount) : undefined,
    studioEquipment: Array.isArray(r.studioEquipment) ? r.studioEquipment : undefined,
    studioServices: Array.isArray(r.studioServices) ? r.studioServices : undefined,
    producers: Array.isArray(r.producers) ? r.producers : [],
    hosts: Array.isArray(r.hosts) ? r.hosts : [],
    stage: r.stage || 'notknow',
    notes: Array.isArray(r.notes) ? r.notes : [],
    rating: r.rating ? Number(r.rating) : undefined,
    estimatedAudience: r.estimatedAudience || '',
    createdAt: r.createdAt || r.created || new Date().toISOString(),
    updatedAt: r.updated || r.created || new Date().toISOString(),
  }));
}

/**
 * Sync a single podcast to PocketBase (Create or Update)
 */
export async function savePodcastToPB(podcast: Podcast): Promise<boolean> {
  try {
    await authenticateAdmin();
    await ensureCollectionsExist();

    const payload = {
      original_id: podcast.id,
      name: podcast.name,
      description: podcast.description,
      youtubeUrl: podcast.youtubeUrl,
      youtubeChannelId: podcast.youtubeChannelId,
      coverImage: podcast.coverImage,
      websiteUrl: podcast.websiteUrl || '',
      country: podcast.country,
      state: podcast.state,
      city: podcast.city,
      latitude: podcast.latitude,
      longitude: podcast.longitude,
      language: podcast.language,
      niche: podcast.niche,
      entityType: podcast.entityType || 'podcast',
      studioType: podcast.studioType || '',
      hourlyRate: podcast.hourlyRate || '',
      roomsCount: podcast.roomsCount || 0,
      studioEquipment: podcast.studioEquipment || [],
      studioServices: podcast.studioServices || [],
      producers: podcast.producers || [],
      hosts: podcast.hosts || [],
      stage: podcast.stage,
      notes: podcast.notes || [],
      rating: podcast.rating || 5,
      estimatedAudience: podcast.estimatedAudience || '',
      createdAt: podcast.createdAt || new Date().toISOString(),
    };

    // Find existing record by original_id or id
    let existingRecord: any = null;
    try {
      existingRecord = await pb.collection('podmap_podcasts').getFirstListItem(`original_id="${podcast.id}"`);
    } catch {
      // Not found by original_id, try by id
      try {
        existingRecord = await pb.collection('podmap_podcasts').getOne(podcast.id);
      } catch {
        existingRecord = null;
      }
    }

    if (existingRecord) {
      await pb.collection('podmap_podcasts').update(existingRecord.id, payload);
    } else {
      await pb.collection('podmap_podcasts').create(payload);
    }
    return true;
  } catch (err: any) {
    console.warn('PocketBase podcast sync error:', err);
    throw new Error(`Error saving podcast ${podcast.name}: ${err?.message || String(err)}`);
  }
}

/**
 * Bulk sync list of podcasts to PocketBase
 */
export async function bulkSavePodcastsToPB(podcasts: Podcast[]): Promise<void> {
  for (const podcast of podcasts) {
    await savePodcastToPB(podcast);
  }
}

/**
 * Delete a podcast from PocketBase
 */
export async function deletePodcastFromPB(podcastId: string): Promise<boolean> {
  try {
    await authenticateAdmin();
    const existingRecord = await pb.collection('podmap_podcasts').getFirstListItem(`original_id="${podcastId}"`);
    if (existingRecord) {
      await pb.collection('podmap_podcasts').delete(existingRecord.id);
    }
    return true;
  } catch (err) {
    console.warn('PocketBase podcast deletion warning:', err);
    return false;
  }
}

/**
 * Fetch suggestions from PocketBase
 */
export async function fetchSuggestionsFromPB(): Promise<PodcastSuggestion[] | null> {
  const creds = getPbCredentials();
  const baseUrl = creds.url.replace(/\/+$/, '');

  let records: any[] = [];

  const tryGetSuggestions = async (sortField: string) => {
    try {
      pb.baseUrl = baseUrl;
      return await pb.collection('sponsor_suggestions').getFullList({
        sort: sortField,
        requestKey: null,
      });
    } catch {
      const res = await fetch(`${baseUrl}/api/collections/sponsor_suggestions/records?page=1&perPage=1000&skipTotal=1${sortField ? `&sort=${sortField}` : ''}`, {
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (res.ok) {
        const data = await res.json();
        return data.items || [];
      }
      throw new Error(`Direct fetch status ${res.status}`);
    }
  };

  try {
    try {
      records = await tryGetSuggestions('-createdAt');
    } catch {
      try {
        records = await tryGetSuggestions('-created');
      } catch {
        records = await tryGetSuggestions('');
      }
    }
  } catch (err1) {
    try {
      await authenticateAdmin();
      try {
        records = await pb.collection('sponsor_suggestions').getFullList({ sort: '-createdAt', requestKey: null });
      } catch {
        records = await pb.collection('sponsor_suggestions').getFullList({ sort: '-created', requestKey: null });
      }
    } catch (err3) {
      console.warn('Failed to fetch suggestions from PocketBase:', err3);
      return null;
    }
  }

  if (!records || records.length === 0) {
    return null;
  }

  return records.map((r: any) => ({
    id: r.original_id || r.id,
    podcastName: r.name || r.podcastName || '',
    youtubeUrl: r.youtubeUrl || '',
    instagramUrl: r.instagramUrl || '',
    tiktokUrl: r.tiktokUrl || '',
    studioId: r.studioId || undefined,
    studioName: r.studioName || undefined,
    submitterNote: r.description || r.submitterNote || '',
    country: r.country || '',
    state: r.state || '',
    city: r.city || '',
    language: r.language || '',
    niche: r.niche || '',
    entityType: r.entityType as any,
    studioType: r.studioType as any,
    websiteUrl: r.websiteUrl || undefined,
    equipmentSummary: r.equipmentSummary || undefined,
    producers: Array.isArray(r.producers) ? r.producers : [],
    hosts: Array.isArray(r.hosts) ? r.hosts : [],
    submittedByEmail: r.submittedByEmail || '',
    status: r.status || 'pending',
    createdAt: r.createdAt || r.created || new Date().toISOString(),
  }));
}

/**
 * Save suggestion to PocketBase
 */
export async function saveSuggestionToPB(suggestion: PodcastSuggestion): Promise<boolean> {
  try {
    await authenticateAdmin();
    await ensureCollectionsExist();

    const payload = {
      original_id: suggestion.id,
      name: suggestion.podcastName,
      youtubeUrl: suggestion.youtubeUrl || '',
      instagramUrl: suggestion.instagramUrl || '',
      tiktokUrl: suggestion.tiktokUrl || '',
      studioId: suggestion.studioId || '',
      studioName: suggestion.studioName || '',
      description: suggestion.submitterNote || '',
      country: suggestion.country,
      state: suggestion.state,
      city: suggestion.city,
      language: suggestion.language,
      niche: suggestion.niche,
      entityType: suggestion.entityType || 'podcast',
      studioType: suggestion.studioType || '',
      websiteUrl: suggestion.websiteUrl || '',
      equipmentSummary: suggestion.equipmentSummary || '',
      producers: suggestion.producers || [],
      hosts: suggestion.hosts || [],
      submittedByEmail: suggestion.submittedByEmail || '',
      status: suggestion.status,
      createdAt: suggestion.createdAt,
    };


    let existingRecord: any = null;
    try {
      existingRecord = await pb.collection('sponsor_suggestions').getFirstListItem(`original_id="${suggestion.id}"`);
    } catch {
      existingRecord = null;
    }

    if (existingRecord) {
      await pb.collection('sponsor_suggestions').update(existingRecord.id, payload);
    } else {
      await pb.collection('sponsor_suggestions').create(payload);
    }
    return true;
  } catch (err) {
    console.warn('PocketBase suggestion sync error:', err);
    return false;
  }
}

/**
 * Bulk sync suggestions to PocketBase
 */
export async function bulkSaveSuggestionsToPB(suggestions: PodcastSuggestion[]): Promise<void> {
  for (const item of suggestions) {
    await saveSuggestionToPB(item);
  }
}

/**
 * Delete suggestion from PocketBase
 */
export async function deleteSuggestionFromPB(suggestionId: string): Promise<boolean> {
  try {
    await authenticateAdmin();
    const existingRecord = await pb.collection('sponsor_suggestions').getFirstListItem(`original_id="${suggestionId}"`);
    if (existingRecord) {
      await pb.collection('sponsor_suggestions').delete(existingRecord.id);
    }
    return true;
  } catch (err) {
    console.warn('PocketBase suggestion delete warning:', err);
    return false;
  }
}

export interface PbDiagnosticStep {
  name: string;
  status: 'pending' | 'success' | 'warning' | 'error';
  message: string;
  details?: string;
}

/**
 * Diagnostic tool to debug PocketBase network, CORS, and API rules in production
 */
export async function runPocketBaseDiagnostics(): Promise<PbDiagnosticStep[]> {
  const steps: PbDiagnosticStep[] = [];
  const creds = getPbCredentials();
  const url = creds.url.replace(/\/+$/, '');

  // Step 1: Health Check (HTTP / CORS)
  try {
    const healthRes = await fetch(`${url}/api/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    if (healthRes.ok) {
      steps.push({
        name: 'Conexão HTTP / CORS',
        status: 'success',
        message: `Servidor acessível em ${url}`,
      });
    } else {
      steps.push({
        name: 'Conexão HTTP / CORS',
        status: 'warning',
        message: `Servidor respondeu com HTTP ${healthRes.status}`,
      });
    }
  } catch (err: any) {
    steps.push({
      name: 'Conexão HTTP / CORS',
      status: 'error',
      message: `Bloqueio de CORS ou Rede (${err?.message || String(err)})`,
      details: `O navegador bloqueou a conexão com ${url}. No painel PocketBase (${url}/_/#/settings/cors), adicione a origem ${window.location.origin} ou '*'.`,
    });
    return steps;
  }

  // Step 2: Public API Rule (podcasts)
  try {
    const res = await fetch(`${url}/api/collections/podmap_podcasts/records?perPage=1`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      steps.push({
        name: 'Regra de API Pública (podcasts)',
        status: 'success',
        message: `Acesso público liberado (${data.totalItems || data.items?.length || 0} registros)`,
      });
    } else if (res.status === 403) {
      steps.push({
        name: 'Regra de API Pública (podcasts)',
        status: 'warning',
        message: `Leitura pública bloqueada (HTTP 403). A regra de API (listRule) precisa ser "" (vazio).`,
        details: `No PocketBase (${url}/_/), vá em Collections > podcasts > API Rules e limpe o campo 'List/Search rule' (deixe o campo em branco) para liberar leitura sem obrigatoriedade de admin.`,
      });
    } else if (res.status === 404) {
      steps.push({
        name: 'Regra de API Pública (podcasts)',
        status: 'warning',
        message: `A coleção 'podmap_podcasts' ainda não existe no PocketBase. Execute o Seed.`,
      });
    } else {
      steps.push({
        name: 'Regra de API Pública (podcasts)',
        status: 'warning',
        message: `Status HTTP ${res.status}`,
      });
    }
  } catch (err: any) {
    steps.push({
      name: 'Regra de API Pública (podcasts)',
      status: 'error',
      message: `Erro ao testar API (${err?.message || String(err)})`,
    });
  }

  // Step 3: Admin Auth
  try {
    const authed = await authenticateAdmin();
    if (authed) {
      steps.push({
        name: 'Autenticação Superuser/Admin',
        status: 'success',
        message: `Login de admin realizado com sucesso (${creds.email})`,
      });
    } else {
      steps.push({
        name: 'Autenticação Superuser/Admin',
        status: 'error',
        message: `Falha nas credenciais de admin para ${creds.email}`,
        details: lastAuthErrorMessage || 'Verifique o e-mail e senha cadastrados no PocketBase.',
      });
    }
  } catch (err: any) {
    steps.push({
      name: 'Autenticação Superuser/Admin',
      status: 'error',
      message: `Erro na autenticação (${err?.message || String(err)})`,
    });
  }

  return steps;
}

import { Podcast, PodcastSuggestion } from '../types';

export const INITIAL_PODCASTS: Podcast[] = [
  {
    id: 'pod-1',
    name: 'The Joe Rogan Experience',
    description: 'Long-form conversation with guests including comedians, actors, musicians, authors, artists, and experts.',
    youtubeUrl: 'https://www.youtube.com/@joerogan',
    youtubeChannelId: '@joerogan',
    coverImage: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400&auto=format&fit=crop&q=80',
    country: 'USA',
    state: 'Texas',
    city: 'Austin',
    latitude: 30.2672,
    longitude: -97.7431,
    language: 'English',
    niche: 'Comedy & Society',
    producers: [
      { id: 'prod-1', name: 'Young Jamie Vernon', email: 'jamie@joerogan.com', phone: '+1 (512) 555-0199', role: 'Head Producer & Audio Engineer' },
    ],
    hosts: [
      { id: 'host-1', name: 'Joe Rogan', email: 'joe@joerogan.com', phone: '+1 (512) 555-0100', role: 'Main Host' },
    ],
    stage: 'customer',
    notes: [
      { id: 'n-1', date: '2026-07-20', author: 'Admin', text: 'Contract signed for Q3 product sponsorship.' },
      { id: 'n-2', date: '2026-07-10', author: 'Admin', text: 'Had call with Jamie Vernon regarding studio equipment placement.' }
    ],
    rating: 5,
    estimatedAudience: '11M+ subscribers',
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-07-20T14:30:00Z',
  },
  {
    id: 'pod-2',
    name: 'Huberman Lab',
    description: 'Dr. Andrew Huberman discusses neuroscience: how our brain and its connections with the organs of our body control our behaviors.',
    youtubeUrl: 'https://www.youtube.com/@hubermanlab',
    youtubeChannelId: '@hubermanlab',
    coverImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&auto=format&fit=crop&q=80',
    country: 'USA',
    state: 'California',
    city: 'Stanford',
    latitude: 37.4275,
    longitude: -122.1697,
    language: 'English',
    niche: 'Health & Science',
    producers: [
      { id: 'prod-2', name: 'Robb Wolf', email: 'partnerships@hubermanlab.com', phone: '+1 (650) 555-0142', role: 'Executive Producer' },
    ],
    hosts: [
      { id: 'host-2', name: 'Dr. Andrew Huberman', email: 'andrew@hubermanlab.com', phone: '+1 (650) 555-0188', role: 'Host' },
    ],
    stage: 'partner',
    notes: [
      { id: 'n-3', date: '2026-06-18', author: 'Admin', text: 'Joint content partnership agreed. Co-branded episode in production.' }
    ],
    rating: 5,
    estimatedAudience: '5M+ subscribers',
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-06-18T09:12:00Z',
  },
  {
    id: 'pod-3',
    name: 'Podpah',
    description: 'Maior podcast do Brasil! Entrevistas descontraídas com grandes personalidades, artistas e esportistas.',
    youtubeUrl: 'https://www.youtube.com/@podpah',
    youtubeChannelId: '@podpah',
    coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80',
    country: 'Brazil',
    state: 'São Paulo',
    city: 'São Paulo',
    latitude: -23.5505,
    longitude: -46.6333,
    language: 'Portuguese',
    niche: 'Pop Culture & Entertainment',
    producers: [
      { id: 'prod-3', name: 'Victor Assis', email: 'comercial@podpah.com.br', phone: '+55 11 98888-1234', role: 'Comercial Director' },
    ],
    hosts: [
      { id: 'host-3a', name: 'Igão (Igor Cavalari)', email: 'igao@podpah.com.br', phone: '+55 11 97777-1111', role: 'Host' },
      { id: 'host-3b', name: 'Mítico (Thiago Marques)', email: 'mitico@podpah.com.br', phone: '+55 11 97777-2222', role: 'Host' },
    ],
    stage: 'customer',
    notes: [
      { id: 'n-4', date: '2026-07-02', author: 'Admin', text: 'Campaign renewed for Latin America launch.' }
    ],
    rating: 5,
    estimatedAudience: '7.8M+ subscribers',
    createdAt: '2026-01-20T10:00:00Z',
    updatedAt: '2026-07-02T16:00:00Z',
  },
  {
    id: 'pod-4',
    name: 'The Diary Of A CEO',
    description: 'Steven Bartlett extracts untold lessons, strategies, and vulnerabilities from world-class founders, authors, and experts.',
    youtubeUrl: 'https://www.youtube.com/@TheDiaryOfACEO',
    youtubeChannelId: '@TheDiaryOfACEO',
    coverImage: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&auto=format&fit=crop&q=80',
    country: 'United Kingdom',
    state: 'Greater London',
    city: 'London',
    latitude: 51.5074,
    longitude: -0.1278,
    language: 'English',
    niche: 'Business & Entrepreneurship',
    producers: [
      { id: 'prod-4', name: 'Grace Andrews', email: 'grace@flightstudio.com', phone: '+44 20 7946 0912', role: 'Head of Production' },
    ],
    hosts: [
      { id: 'host-4', name: 'Steven Bartlett', email: 'steven@stevenbartlett.com', phone: '+44 20 7946 0888', role: 'Host' },
    ],
    stage: 'lead',
    notes: [
      { id: 'n-5', date: '2026-07-15', author: 'Admin', text: 'Grace replied positively to rate card request. Scheduling intro call.' }
    ],
    rating: 5,
    estimatedAudience: '6.2M+ subscribers',
    createdAt: '2026-03-10T10:00:00Z',
    updatedAt: '2026-07-15T11:20:00Z',
  },
  {
    id: 'pod-5',
    name: 'Lex Fridman Podcast',
    description: 'Conversations about AI, science, technology, philosophy, history, intelligence, consciousness, and love.',
    youtubeUrl: 'https://www.youtube.com/@lexfridman',
    youtubeChannelId: '@lexfridman',
    coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&auto=format&fit=crop&q=80',
    country: 'USA',
    state: 'Massachusetts',
    city: 'Cambridge',
    latitude: 42.3736,
    longitude: -71.1097,
    language: 'English',
    niche: 'Tech & AI',
    producers: [
      { id: 'prod-5', name: 'Lex Fridman', email: 'lex@lexfridman.com', phone: '+1 (617) 555-0177', role: 'Creator & Producer' },
    ],
    hosts: [
      { id: 'host-5', name: 'Lex Fridman', email: 'lex@lexfridman.com', phone: '+1 (617) 555-0177', role: 'Host' },
    ],
    stage: 'contacted',
    notes: [
      { id: 'n-6', date: '2026-07-01', author: 'Admin', text: 'Outreach email sent regarding AI tools showcase episode.' }
    ],
    rating: 5,
    estimatedAudience: '4.1M+ subscribers',
    createdAt: '2026-02-14T10:00:00Z',
    updatedAt: '2026-07-01T15:45:00Z',
  },
  {
    id: 'pod-6',
    name: 'Flow Podcast',
    description: 'Um dos maiores podcasts de conversa e entrevistas descontraídas do Brasil, transmitido diretamente dos estúdios Flow.',
    youtubeUrl: 'https://www.youtube.com/@flowpodcast',
    youtubeChannelId: '@flowpodcast',
    coverImage: 'https://images.unsplash.com/photo-1589903308904-1010c2294adc?w=400&auto=format&fit=crop&q=80',
    country: 'Brazil',
    state: 'São Paulo',
    city: 'São Paulo',
    latitude: -23.5615,
    longitude: -46.6560,
    language: 'Portuguese',
    niche: 'Pop Culture & Entertainment',
    producers: [
      { id: 'prod-6', name: 'Gianluca (Giannino)', email: 'contato@estudioflow.com.br', phone: '+55 11 96666-3333', role: 'Lead Producer' },
    ],
    hosts: [
      { id: 'host-6', name: 'Igor 3K', email: 'igor3k@estudioflow.com.br', phone: '+55 11 96666-4444', role: 'Host' },
    ],
    stage: 'partner',
    notes: [
      { id: 'n-7', date: '2026-06-25', author: 'Admin', text: 'Media kit updated. Cross-promotion deal active.' }
    ],
    rating: 4,
    estimatedAudience: '5.4M+ subscribers',
    createdAt: '2026-02-18T10:00:00Z',
    updatedAt: '2026-06-25T13:00:00Z',
  },
  {
    id: 'pod-7',
    name: 'Mano a Mano',
    description: 'Mano Brown conduz conversas profundas sobre música, sociedade, política e cultura urbana com personalidades de destaque.',
    youtubeUrl: 'https://www.youtube.com/@manobrownoficial',
    youtubeChannelId: '@manobrownoficial',
    coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&auto=format&fit=crop&q=80',
    country: 'Brazil',
    state: 'São Paulo',
    city: 'São Paulo',
    latitude: -23.5489,
    longitude: -46.6388,
    language: 'Portuguese',
    niche: 'Society & Music',
    producers: [
      { id: 'prod-7', name: 'Kátia Lund', email: 'producao@manoamano.com.br', phone: '+55 11 95555-7777', role: 'Executive Producer' },
    ],
    hosts: [
      { id: 'host-7', name: 'Mano Brown', email: 'brown@racionais.com.br', phone: '+55 11 95555-8888', role: 'Host' },
    ],
    stage: 'viewed',
    notes: [
      { id: 'n-8', date: '2026-07-22', author: 'Admin', text: 'Researched audience demographic. High relevance for social impact initiatives.' }
    ],
    rating: 5,
    estimatedAudience: '2.5M+ listeners',
    createdAt: '2026-04-05T10:00:00Z',
    updatedAt: '2026-07-22T10:15:00Z',
  },
  {
    id: 'pod-8',
    name: 'El Podcast de Marian Rojas Estapé',
    description: 'Estrategias práticas de psiquiatria e neurociência para lidar com ansiedade, estresse e relacionamentos.',
    youtubeUrl: 'https://www.youtube.com/@marianrojasestape',
    youtubeChannelId: '@marianrojasestape',
    coverImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    country: 'Spain',
    state: 'Madrid',
    city: 'Madrid',
    latitude: 40.4168,
    longitude: -3.7038,
    language: 'Spanish',
    niche: 'Health & Science',
    producers: [
      { id: 'prod-8', name: 'Carlos Estapé', email: 'produccion@marianrojas.com', phone: '+34 91 555 0199', role: 'Producer' },
    ],
    hosts: [
      { id: 'host-8', name: 'Marian Rojas Estapé', email: 'marian@marianrojas.com', phone: '+34 91 555 0100', role: 'Host & Psychiatrist' },
    ],
    stage: 'lead',
    notes: [
      { id: 'n-9', date: '2026-07-18', author: 'Admin', text: 'Requested pricing for Spanish market campaign.' }
    ],
    rating: 5,
    estimatedAudience: '1.8M+ subscribers',
    createdAt: '2026-03-22T10:00:00Z',
    updatedAt: '2026-07-18T14:00:00Z',
  },
  {
    id: 'pod-9',
    name: 'O Vento e a Onda - Floripa Tech',
    description: 'Podcast sobre empreendedorismo, inovação, ecossistema de startups e tecnologia na Ilha do Silício em Florianópolis.',
    youtubeUrl: 'https://www.youtube.com/@floripatech',
    youtubeChannelId: '@floripatech',
    coverImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&auto=format&fit=crop&q=80',
    country: 'Brazil',
    state: 'Santa Catarina',
    city: 'Florianópolis',
    latitude: -27.5954,
    longitude: -48.5480,
    language: 'Portuguese',
    niche: 'Tech & AI',
    producers: [
      { id: 'prod-9', name: 'Camila Rossi', email: 'camila@floripatech.com.br', phone: '+55 48 99123-4567', role: 'Producer' },
    ],
    hosts: [
      { id: 'host-9', name: 'Lucas Silveira', email: 'lucas@floripatech.com.br', phone: '+55 48 99876-5432', role: 'Host' },
    ],
    stage: 'notknow',
    notes: [
      { id: 'n-10', date: '2026-07-25', author: 'Admin', text: 'Added from local tech ecosystem research.' }
    ],
    rating: 4,
    estimatedAudience: '85k subscribers',
    createdAt: '2026-07-25T08:00:00Z',
    updatedAt: '2026-07-25T08:00:00Z',
  },
  {
    id: 'pod-10',
    name: 'The Rest Is Politics',
    description: 'Alastair Campbell and Rory Stewart disagree agreeably on global news, world diplomacy, and UK politics.',
    youtubeUrl: 'https://www.youtube.com/@therestispolitics',
    youtubeChannelId: '@therestispolitics',
    coverImage: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=400&auto=format&fit=crop&q=80',
    country: 'United Kingdom',
    state: 'Greater London',
    city: 'London',
    latitude: 51.5150,
    longitude: -0.1410,
    language: 'English',
    niche: 'Education & News',
    producers: [
      { id: 'prod-10', name: 'Jack Davenport', email: 'jack@goalhanger.com', phone: '+44 20 7123 4567', role: 'Goalhanger Podcasts Producer' },
    ],
    hosts: [
      { id: 'host-10a', name: 'Alastair Campbell', email: 'alastair@therestispolitics.com', phone: '+44 20 7123 1111', role: 'Co-Host' },
      { id: 'host-10b', name: 'Rory Stewart', email: 'rory@therestispolitics.com', phone: '+44 20 7123 2222', role: 'Co-Host' },
    ],
    stage: 'ex-customer',
    notes: [
      { id: 'n-11', date: '2026-05-10', author: 'Admin', text: 'Sponsorship campaign completed in May 2026.' }
    ],
    rating: 5,
    estimatedAudience: '1.2M+ subscribers',
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-05-10T17:00:00Z',
  },
  {
    id: 'pod-11',
    name: 'O3 / Yuka Onishi AI Podcast',
    description: 'Leading Japanese podcast exploring generative AI, robotics startups, and deep tech investments in Tokyo.',
    youtubeUrl: 'https://www.youtube.com/@tokyoaipodcast',
    youtubeChannelId: '@tokyoaipodcast',
    coverImage: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=400&auto=format&fit=crop&q=80',
    country: 'Japan',
    state: 'Tokyo',
    city: 'Tokyo',
    latitude: 35.6762,
    longitude: 139.6503,
    language: 'Japanese',
    niche: 'Tech & AI',
    producers: [
      { id: 'prod-11', name: 'Kenji Sato', email: 'sato@tokyoai.jp', phone: '+81 3 5555 0144', role: 'Producer' },
    ],
    hosts: [
      { id: 'host-11', name: 'Yuka Onishi', email: 'yuka@tokyoai.jp', phone: '+81 3 5555 0100', role: 'Host' },
    ],
    stage: 'viewed',
    notes: [
      { id: 'n-12', date: '2026-07-28', author: 'Admin', text: 'High potential for Asian market expansion.' }
    ],
    rating: 4,
    estimatedAudience: '320k subscribers',
    createdAt: '2026-06-01T10:00:00Z',
    updatedAt: '2026-07-28T09:00:00Z',
  },
  {
    id: 'pod-12',
    name: 'All-In Podcast',
    description: 'Chamath Palihapitiya, Jason Calacanis, David Sacks & David Friedberg cover tech, economy, politics, and poker.',
    youtubeUrl: 'https://www.youtube.com/@allin',
    youtubeChannelId: '@allin',
    coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&auto=format&fit=crop&q=80',
    country: 'USA',
    state: 'California',
    city: 'San Francisco',
    latitude: 37.7749,
    longitude: -122.4194,
    language: 'English',
    niche: 'Business & Entrepreneurship',
    producers: [
      { id: 'prod-12', name: 'Nick', email: 'producers@allinpodcast.co', phone: '+1 (415) 555-0191', role: 'Lead Producer' },
    ],
    hosts: [
      { id: 'host-12a', name: 'Jason Calacanis', email: 'jason@calacanis.com', phone: '+1 (415) 555-0101', role: 'Co-Host' },
      { id: 'host-12b', name: 'Chamath Palihapitiya', email: 'chamath@socialcapital.com', phone: '+1 (415) 555-0102', role: 'Co-Host' },
    ],
    stage: 'contacted',
    notes: [
      { id: 'n-13', date: '2026-07-12', author: 'Admin', text: 'Sent email regarding live event integration opportunity.' }
    ],
    rating: 5,
    estimatedAudience: '850k subscribers',
    createdAt: '2026-02-10T10:00:00Z',
    updatedAt: '2026-07-12T14:20:00Z',
  }
];

export const INITIAL_SUGGESTIONS: PodcastSuggestion[] = [
  {
    id: 'sug-1',
    podcastName: 'La Cotorrisa',
    youtubeUrl: 'https://www.youtube.com/@LaCotorrisa',
    country: 'Mexico',
    state: 'CDMX',
    city: 'Mexico City',
    language: 'Spanish',
    niche: 'Comedy & Society',
    producers: [
      { id: 'sp-1', name: 'Gabo', email: 'contacto@lacotorrisa.mx', phone: '+52 55 1234 5678' }
    ],
    hosts: [
      { id: 'sh-1', name: 'Ricardo Pérez & Slobotzky', email: 'hosts@lacotorrisa.mx', phone: '+52 55 9876 5432' }
    ],
    submittedByEmail: 'listener@gmail.com',
    submitterNote: 'Huge comedy podcast in Mexico, would love to see them on the CRM map!',
    status: 'pending',
    createdAt: '2026-07-30T14:00:00Z'
  }
];

interface GameSeed {
  title: string;
  slug: string;
  description: string;
  price: number;
  categorySlug: string;
  developer: string;
  publisher: string;
  imageUrl: string;
  bannerUrl: string;
  accentColor: string;
  isFeatured: boolean;
}

function gameImages(slug: string) {
  return {
    imageUrl: `/images/games/${slug}/cover.webp`,
    bannerUrl: `/images/games/${slug}/banner.webp`,
  };
}

export const games: GameSeed[] = [
  {
    title: 'Grand Theft Auto VI',
    slug: 'grand-theft-auto-vi',
    description:
      'Explore Leonida e as ruas de Vice City em uma aventura criminal de mundo aberto, acompanhando Jason e Lucia em uma história de ambição, perigo e sobrevivência.',
    price: 34990,
    categorySlug: 'action',
    developer: 'Rockstar Games',
    publisher: 'Rockstar Games',
    ...gameImages('grand-theft-auto-vi'),
    accentColor: '#F472B6',
    isFeatured: true,
  },
  {
    title: '007 First Light',
    slug: '007-first-light',
    description:
      'Descubra as origens de James Bond em uma aventura de espionagem que combina ação, infiltração e operações internacionais.',
    price: 29990,
    categorySlug: 'action',
    developer: 'IO Interactive',
    publisher: 'IO Interactive',
    ...gameImages('007-first-light'),
    accentColor: '#EAB54A',
    isFeatured: true,
  },
  {
    title: 'Cyberpunk 2077',
    slug: 'cyberpunk-2077',
    description:
      'Construa sua própria lenda em Night City, uma metrópole futurista dominada por corporações, tecnologia e criminosos.',
    price: 14990,
    categorySlug: 'rpg',
    developer: 'CD Projekt Red',
    publisher: 'CD Projekt Red',
    ...gameImages('cyberpunk-2077'),
    accentColor: '#FCEE09',
    isFeatured: true,
  },
  {
    title: 'Battlefield 6',
    slug: 'battlefield-6',
    description:
      'Enfrente batalhas intensas em larga escala, com combate de infantaria, veículos militares e ambientes destrutíveis.',
    price: 29990,
    categorySlug: 'fps',
    developer: 'Battlefield Studios',
    publisher: 'Electronic Arts',
    ...gameImages('battlefield-6'),
    accentColor: '#2DD4BF',
    isFeatured: true,
  },
  {
    title: 'Resident Evil Requiem',
    slug: 'resident-evil-requiem',
    description:
      'Enfrente uma experiência de terror e sobrevivência marcada por mistérios, ameaças biológicas e uma atmosfera perturbadora.',
    price: 24990,
    categorySlug: 'horror',
    developer: 'Capcom',
    publisher: 'Capcom',
    ...gameImages('resident-evil-requiem'),
    accentColor: '#94A3B8',
    isFeatured: false,
  },
  {
    title: 'Crimson Desert',
    slug: 'crimson-desert',
    description:
      'Explore um vasto mundo de fantasia, participe de combates intensos e descubra os conflitos do continente de Pywel.',
    price: 29990,
    categorySlug: 'rpg',
    developer: 'Pearl Abyss',
    publisher: 'Pearl Abyss',
    ...gameImages('crimson-desert'),
    accentColor: '#DC2626',
    isFeatured: false,
  },
  {
    title: 'Death Stranding 2: On the Beach',
    slug: 'death-stranding-2',
    description:
      'Embarque em uma jornada por territórios desconhecidos em uma experiência que explora as conexões humanas e a sobrevivência.',
    price: 29990,
    categorySlug: 'action',
    developer: 'Kojima Productions',
    publisher: 'Sony Interactive Entertainment',
    ...gameImages('death-stranding-2'),
    accentColor: '#60A5FA',
    isFeatured: false,
  },
  {
    title: 'DOOM: The Dark Ages',
    slug: 'doom-the-dark-ages',
    description:
      'Assuma o papel do Doom Slayer em uma guerra brutal contra forças demoníacas em um universo medieval sombrio.',
    price: 24990,
    categorySlug: 'fps',
    developer: 'id Software',
    publisher: 'Bethesda Softworks',
    ...gameImages('doom-the-dark-ages'),
    accentColor: '#F97316',
    isFeatured: false,
  },
  {
    title: 'Ghost of Yōtei',
    slug: 'ghost-of-yotei',
    description:
      'Explore paisagens do Japão feudal em uma jornada de vingança, descoberta e combates cinematográficos.',
    price: 29990,
    categorySlug: 'action',
    developer: 'Sucker Punch Productions',
    publisher: 'Sony Interactive Entertainment',
    ...gameImages('ghost-of-yotei'),
    accentColor: '#EAB308',
    isFeatured: false,
  },
  {
    title: "Assassin's Creed Shadows",
    slug: 'assassins-creed-shadows',
    description:
      'Vivencie o Japão feudal através de dois protagonistas, combinando furtividade, exploração e combates de samurais.',
    price: 24990,
    categorySlug: 'action',
    developer: 'Ubisoft Quebec',
    publisher: 'Ubisoft',
    ...gameImages('assassins-creed-shadows'),
    accentColor: '#EF4444',
    isFeatured: false,
  },
  {
    title: 'Monster Hunter Wilds',
    slug: 'monster-hunter-wilds',
    description:
      'Explore ecossistemas selvagens, enfrente criaturas gigantescas e desenvolva equipamentos para se tornar um caçador lendário.',
    price: 24990,
    categorySlug: 'rpg',
    developer: 'Capcom',
    publisher: 'Capcom',
    ...gameImages('monster-hunter-wilds'),
    accentColor: '#D4A853',
    isFeatured: false,
  },
  {
    title: 'Kingdom Come: Deliverance II',
    slug: 'kingdom-come-deliverance-2',
    description:
      'Mergulhe em uma aventura medieval que combina narrativa histórica, exploração e combates realistas.',
    price: 19990,
    categorySlug: 'rpg',
    developer: 'Warhorse Studios',
    publisher: 'Deep Silver',
    ...gameImages('kingdom-come-deliverance-2'),
    accentColor: '#D97706',
    isFeatured: false,
  },
  {
    title: 'Elden Ring Nightreign',
    slug: 'elden-ring-nightreign',
    description:
      'Enfrente desafios mortais em uma experiência cooperativa ambientada no universo de Elden Ring.',
    price: 19990,
    categorySlug: 'rpg',
    developer: 'FromSoftware',
    publisher: 'Bandai Namco Entertainment',
    ...gameImages('elden-ring-nightreign'),
    accentColor: '#818CF8',
    isFeatured: false,
  },
  {
    title: 'Hollow Knight: Silksong',
    slug: 'hollow-knight-silksong',
    description:
      'Acompanhe Hornet em uma aventura por um reino desconhecido, repleto de criaturas, mistérios e desafios de plataforma.',
    price: 7990,
    categorySlug: 'indie',
    developer: 'Team Cherry',
    publisher: 'Team Cherry',
    ...gameImages('hollow-knight-silksong'),
    accentColor: '#DC2626',
    isFeatured: false,
  },
  {
    title: 'Hades II',
    slug: 'hades-2',
    description:
      'Domine poderes sobrenaturais e enfrente as forças do submundo em uma aventura roguelike inspirada na mitologia grega.',
    price: 9990,
    categorySlug: 'indie',
    developer: 'Supergiant Games',
    publisher: 'Supergiant Games',
    ...gameImages('hades-2'),
    accentColor: '#34D399',
    isFeatured: false,
  },
  {
    title: 'Red Dead Redemption 2',
    slug: 'red-dead-redemption-2',
    description:
      'Viva os últimos dias do Velho Oeste ao lado de Arthur Morgan e da gangue Van der Linde em um mundo aberto imersivo.',
    price: 19990,
    categorySlug: 'action',
    developer: 'Rockstar Games',
    publisher: 'Rockstar Games',
    ...gameImages('red-dead-redemption-2'),
    accentColor: '#DC2626',
    isFeatured: false,
  },
  {
    title: 'Forza Horizon 5',
    slug: 'forza-horizon-5',
    description:
      'Explore as paisagens do México, colecione veículos e participe de corridas em um festival automotivo de mundo aberto.',
    price: 19990,
    categorySlug: 'racing',
    developer: 'Playground Games',
    publisher: 'Xbox Game Studios',
    ...gameImages('forza-horizon-5'),
    accentColor: '#EC4899',
    isFeatured: false,
  },
  {
    title: 'Assetto Corsa EVO',
    slug: 'assetto-corsa-evo',
    description:
      'Experimente uma simulação automobilística com veículos detalhados, física avançada e circuitos de corrida.',
    price: 14990,
    categorySlug: 'racing',
    developer: 'Kunos Simulazioni',
    publisher: '505 Games',
    ...gameImages('assetto-corsa-evo'),
    accentColor: '#EF4444',
    isFeatured: false,
  },
  {
    title: 'Clair Obscur: Expedition 33',
    slug: 'clair-obscur-expedition-33',
    description:
      'Lidere uma expedição em um universo de fantasia artística, combinando combates por turnos e uma narrativa emocionante.',
    price: 19990,
    categorySlug: 'rpg',
    developer: 'Sandfall Interactive',
    publisher: 'Kepler Interactive',
    ...gameImages('clair-obscur-expedition-33'),
    accentColor: '#D4A853',
    isFeatured: false,
  },
  {
    title: 'Silent Hill f',
    slug: 'silent-hill-f',
    description:
      'Investigue acontecimentos perturbadores em uma cidade japonesa envolvida por uma atmosfera de terror psicológico.',
    price: 24990,
    categorySlug: 'horror',
    developer: 'NeoBards Entertainment',
    publisher: 'Konami',
    ...gameImages('silent-hill-f'),
    accentColor: '#BE123C',
    isFeatured: false,
  },
];
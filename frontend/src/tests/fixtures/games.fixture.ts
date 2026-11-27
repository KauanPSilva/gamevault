import type { Game } from '../../types/game';

export const gtaGame: Game = {
  id: '72539d5b-59d0-4ddd-9b3e-52ff785ff0c9',
  title: 'Grand Theft Auto VI',
  slug: 'grand-theft-auto-vi',
  description: 'Explore Leonida e as ruas de Vice City.',
  price: 34990,
  imageUrl: '/images/games/grand-theft-auto-vi/cover.webp',
  bannerUrl: '/images/games/grand-theft-auto-vi/banner.webp',
  accentColor: '#F472B6',
  isFeatured: true,
  developer: 'Rockstar Games',
  publisher: 'Rockstar Games',
  releaseDate: null,
  createdAt: '2026-11-27T19:06:10.810Z',
  category: {
    id: '530c726a-74f0-47bf-9455-d33076bf4892',
    name: 'Ação',
    slug: 'action',
  },
};

export const cyberpunkGame: Game = {
  id: '0b6562ec-ab9e-49aa-84d0-77278f141a1e',
  title: 'Cyberpunk 2077',
  slug: 'cyberpunk-2077',
  description: 'Construa sua própria lenda em Night City.',
  price: 14990,
  imageUrl: '/images/games/cyberpunk-2077/cover.webp',
  bannerUrl: '/images/games/cyberpunk-2077/banner.webp',
  accentColor: '#FCEE09',
  isFeatured: true,
  developer: 'CD Projekt Red',
  publisher: 'CD Projekt Red',
  releaseDate: null,
  createdAt: '2026-11-27T19:06:10.814Z',
  category: {
    id: 'a7f1e967-ef49-4f16-8cfa-b61264c99357',
    name: 'RPG',
    slug: 'rpg',
  },
};

export const featuredGames = [
  gtaGame,
  cyberpunkGame,
];
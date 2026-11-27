import { Search, X } from 'lucide-react';

import type {
  CatalogCategory,
  GameSort,
} from '../../types/game';

interface CatalogFiltersProps {
  search: string;
  category: string;
  sort: GameSort;
  categories: CatalogCategory[];
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onSortChange: (value: GameSort) => void;
}

const sortOptions: {
  value: GameSort;
  label: string;
}[] = [
  { value: 'newest', label: 'Mais recentes' },
  { value: 'price_asc', label: 'Menor preço' },
  { value: 'price_desc', label: 'Maior preço' },
  { value: 'title_asc', label: 'Nome: A-Z' },
  { value: 'title_desc', label: 'Nome: Z-A' },
];

export function CatalogFilters({
  search,
  category,
  sort,
  categories,
  onSearchChange,
  onCategoryChange,
  onSortChange,
}: CatalogFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">

        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={20}
            aria-hidden="true"
            className="absolute top-1/2 left-4 -translate-y-1/2 text-text-muted"
          />

          <input
            type="search"
            aria-label="Buscar jogos"
            placeholder="Buscar jogos..."
            maxLength={100}
            value={search}
            onChange={(event) =>
              onSearchChange(event.target.value)
            }
            className="w-full rounded-xl border border-border bg-surface py-3.5 pr-12 pl-12 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-[var(--game-accent)]"
          />

          {search && (
            <button
              type="button"
              aria-label="Limpar pesquisa"
              onClick={() => onSearchChange('')}
              className="absolute top-1/2 right-4 -translate-y-1/2 text-text-muted hover:text-white"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Sorting */}
        <select
          aria-label="Ordenar jogos"
          value={sort}
          onChange={(event) =>
            onSortChange(event.target.value as GameSort)
          }
          className="rounded-xl border border-border bg-surface px-4 py-3.5 text-sm text-text-secondary outline-none focus:border-[var(--game-accent)] sm:min-w-48"
        >
          {sortOptions.map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Categories */}
      <div
        role="group"
        aria-label="Filtrar por categoria"
        className="flex flex-wrap gap-2"
      >
        <button
          type="button"
          aria-pressed={category === ''}
          onClick={() => onCategoryChange('')}
          className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
            category === ''
              ? 'accent-button'
              : 'border border-border bg-surface text-text-secondary hover:bg-elevated'
          }`}
        >
          Todos
        </button>

        {categories.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={category === item.slug}
            onClick={() => onCategoryChange(item.slug)}
            className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
              category === item.slug
                ? 'accent-button'
                : 'border border-border bg-surface text-text-secondary hover:bg-elevated'
            }`}
          >
            {item.name}

            <span className="ml-2 text-xs opacity-60">
              {item.gameCount}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
import { describe, expect, it, vi } from 'vitest';

import {
  render,
  screen,
} from '@testing-library/react';

import userEvent from '@testing-library/user-event';

import type { ComponentProps } from 'react';

import { CatalogFilters } from '../../features/catalog/CatalogFilters';

type FilterProps = ComponentProps<typeof CatalogFilters>;

function renderFilters(overrides: Partial<FilterProps> = {}) {
  const props: FilterProps = {
    search: '',
    category: '',
    sort: 'newest',
    categories: [
      {
        id: 'category-1',
        name: 'Ação',
        slug: 'action',
        gameCount: 6,
      },
      {
        id: 'category-2',
        name: 'RPG',
        slug: 'rpg',
        gameCount: 6,
      },
    ],
    onSearchChange: vi.fn(),
    onCategoryChange: vi.fn(),
    onSortChange: vi.fn(),
    ...overrides,
  };

  render(<CatalogFilters {...props} />);

  return props;
}

describe('CatalogFilters', () => {
  it('should display the search input', () => {
    renderFilters();

    expect(
      screen.getByRole('searchbox', {
        name: 'Buscar jogos',
      }),
    ).toBeInTheDocument();
  });

  it('should display the current search value', () => {
    renderFilters({
      search: 'Cyberpunk',
    });

    expect(
      screen.getByRole('searchbox'),
    ).toHaveValue('Cyberpunk');
  });

  it('should notify when the search changes', async () => {
    const user = userEvent.setup();
    const props = renderFilters();

    await user.type(
      screen.getByRole('searchbox'),
      'G',
    );

    expect(
      props.onSearchChange,
    ).toHaveBeenCalledWith('G');
  });

  it('should clear the search', async () => {
    const user = userEvent.setup();

    const props = renderFilters({
      search: 'Cyberpunk',
    });

    await user.click(
      screen.getByRole('button', {
        name: 'Limpar pesquisa',
      }),
    );

    expect(
      props.onSearchChange,
    ).toHaveBeenCalledWith('');
  });

  it('should hide the clear button when search is empty', () => {
    renderFilters();

    expect(
      screen.queryByRole('button', {
        name: 'Limpar pesquisa',
      }),
    ).not.toBeInTheDocument();
  });

  it('should display available categories', () => {
    renderFilters();

    expect(
      screen.getByRole('button', {
        name: /ação/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', {
        name: /rpg/i,
      }),
    ).toBeInTheDocument();
  });

  it('should select all categories by default', () => {
    renderFilters();

    expect(
      screen.getByRole('button', {
        name: 'Todos',
      }),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('should highlight the selected category', () => {
    renderFilters({
      category: 'rpg',
    });

    expect(
      screen.getByRole('button', {
        name: /rpg/i,
      }),
    ).toHaveAttribute('aria-pressed', 'true');

    expect(
      screen.getByRole('button', {
        name: 'Todos',
      }),
    ).toHaveAttribute('aria-pressed', 'false');
  });

  it('should notify when a category is selected', async () => {
    const user = userEvent.setup();
    const props = renderFilters();

    await user.click(
      screen.getByRole('button', {
        name: /rpg/i,
      }),
    );

    expect(
      props.onCategoryChange,
    ).toHaveBeenCalledWith('rpg');
  });

  it('should notify when the active category is clicked again', async () => {
    const user = userEvent.setup();

    const props = renderFilters({
      category: 'rpg',
    });

    await user.click(
      screen.getByRole('button', {
        name: /rpg/i,
      }),
    );

    expect(
      props.onCategoryChange,
    ).toHaveBeenCalledWith('rpg');
  });

  it('should notify when all categories are selected', async () => {
    const user = userEvent.setup();

    const props = renderFilters({
      category: 'rpg',
    });

    await user.click(
      screen.getByRole('button', {
        name: 'Todos',
      }),
    );

    expect(
      props.onCategoryChange,
    ).toHaveBeenCalledWith('');
  });

  it('should display the current sorting option', () => {
    renderFilters({
      sort: 'price_asc',
    });

    expect(
      screen.getByRole('combobox', {
        name: 'Ordenar jogos',
      }),
    ).toHaveValue('price_asc');
  });

  it('should notify when sorting changes', async () => {
    const user = userEvent.setup();
    const props = renderFilters();

    await user.selectOptions(
      screen.getByRole('combobox', {
        name: 'Ordenar jogos',
      }),
      'price_desc',
    );

    expect(
      props.onSortChange,
    ).toHaveBeenCalledWith('price_desc');
  });

  it('should render without available categories', () => {
    renderFilters({
      categories: [],
    });

    expect(
      screen.getByRole('button', {
        name: 'Todos',
      }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole('button', {
        name: /rpg/i,
      }),
    ).not.toBeInTheDocument();
  });
});
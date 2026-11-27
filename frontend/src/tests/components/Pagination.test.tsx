import {
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  render,
  screen,
} from '@testing-library/react';

import userEvent from '@testing-library/user-event';

import { Pagination } from '../../components/ui/Pagination';

describe('Pagination', () => {
  it('should display the current page and total pages', () => {
    render(
      <Pagination
        page={2}
        totalPages={5}
        onPageChange={vi.fn()}
      />,
    );

    expect(
      screen.getByText('Página', {
        exact: false,
      }),
    ).toHaveTextContent('Página 2 de 5');
  });

  it('should disable the previous button on the first page', () => {
    render(
      <Pagination
        page={1}
        totalPages={3}
        onPageChange={vi.fn()}
      />,
    );

    expect(
      screen.getByRole('button', {
        name: 'Anterior',
      }),
    ).toBeDisabled();
  });

  it('should disable the next button on the last page', () => {
    render(
      <Pagination
        page={3}
        totalPages={3}
        onPageChange={vi.fn()}
      />,
    );

    expect(
      screen.getByRole('button', {
        name: 'Próxima',
      }),
    ).toBeDisabled();
  });

  it('should navigate to the next page', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();

    render(
      <Pagination
        page={1}
        totalPages={3}
        onPageChange={onPageChange}
      />,
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Próxima',
      }),
    );

    expect(onPageChange).toHaveBeenCalledWith(2);
    expect(onPageChange).toHaveBeenCalledTimes(1);
  });

  it('should navigate to the previous page', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();

    render(
      <Pagination
        page={2}
        totalPages={3}
        onPageChange={onPageChange}
      />,
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Anterior',
      }),
    );

    expect(onPageChange).toHaveBeenCalledWith(1);
    expect(onPageChange).toHaveBeenCalledTimes(1);
  });

  it('should disable both buttons while updating', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();

    render(
      <Pagination
        page={2}
        totalPages={3}
        disabled
        onPageChange={onPageChange}
      />,
    );

    const previousButton = screen.getByRole('button', {
      name: 'Anterior',
    });

    const nextButton = screen.getByRole('button', {
      name: 'Próxima',
    });

    expect(previousButton).toBeDisabled();
    expect(nextButton).toBeDisabled();

    await user.click(previousButton);
    await user.click(nextButton);

    expect(onPageChange).not.toHaveBeenCalled();
  });

  it.each([0, 1])(
    'should hide pagination when there are %i total pages',
    (totalPages) => {
      const { container } = render(
        <Pagination
          page={1}
          totalPages={totalPages}
          onPageChange={vi.fn()}
        />,
      );

      expect(container).toBeEmptyDOMElement();
    },
  );
});
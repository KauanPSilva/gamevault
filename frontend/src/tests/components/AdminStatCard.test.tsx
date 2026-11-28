import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  render,
  screen,
} from '@testing-library/react';

import {
  CreditCard,
  CheckCircle2,
  CircleOff,
} from 'lucide-react';

import { AdminStatCard } from '../../features/admin/components/AdminStatCard';

describe('AdminStatCard', () => {
  it('should display the statistic label', () => {
    render(
      <AdminStatCard
        label="Gateways cadastrados"
        value={3}
        icon={CreditCard}
      />,
    );

    expect(
      screen.getByText('Gateways cadastrados'),
    ).toBeInTheDocument();
  });

  it('should display the statistic value', () => {
    render(
      <AdminStatCard
        label="Gateways cadastrados"
        value={3}
        icon={CreditCard}
      />,
    );

    expect(
      screen.getByText('3'),
    ).toBeInTheDocument();
  });

  it('should display zero values', () => {
    render(
      <AdminStatCard
        label="Gateways inativos"
        value={0}
        icon={CircleOff}
        variant="muted"
      />,
    );

    expect(
      screen.getByText('0'),
    ).toBeInTheDocument();
  });

  it('should support the success variant', () => {
    render(
      <AdminStatCard
        label="Gateways ativos"
        value={2}
        icon={CheckCircle2}
        variant="success"
      />,
    );

    expect(
      screen.getByText('Gateways ativos'),
    ).toBeInTheDocument();

    expect(
      screen.getByText('2'),
    ).toBeInTheDocument();
  });

  it('should update when the statistic changes', () => {
    const { rerender } = render(
      <AdminStatCard
        label="Gateways ativos"
        value={1}
        icon={CheckCircle2}
      />,
    );

    expect(
      screen.getByText('1'),
    ).toBeInTheDocument();

    rerender(
      <AdminStatCard
        label="Gateways ativos"
        value={0}
        icon={CheckCircle2}
      />,
    );

    expect(
      screen.getByText('0'),
    ).toBeInTheDocument();

    expect(
      screen.queryByText('1'),
    ).not.toBeInTheDocument();
  });
});
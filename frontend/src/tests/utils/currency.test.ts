import { describe, expect, it } from 'vitest';

import { formatCurrency } from '../../utils/currency';

describe('formatCurrency', () => {
  it.each([
    [34990, 'R$ 349,90'],
    [14990, 'R$ 149,90'],
    [0, 'R$ 0,00'],
    [1, 'R$ 0,01'],
    [100, 'R$ 1,00'],
    [999, 'R$ 9,99'],
    [100000, 'R$ 1.000,00'],
  ])('should format %i cents correctly', (cents, expected) => {
    const result = formatCurrency(cents)
      .replace(/\u00a0/g, ' ');

    expect(result).toBe(expected);
  });
});
import { describe, it, expect } from 'vitest';

import { getAuthRedirect } from '../../utils/auth-redirect';

describe('getAuthRedirect', () => {
  it.each([
    undefined,
    null,
    {},
    'checkout',
    { from: 123 },
  ])('should return home for invalid state: %j', (state) => {
    expect(getAuthRedirect(state)).toBe('/');
  });

  it.each([
    '/checkout',
    '/library',
    '/orders',
    '/games/cyberpunk-2077',
    '/?category=rpg',
    '/checkout?method=pix#payment',
  ])('should allow internal destination: %s', (from) => {
    expect(getAuthRedirect({ from })).toBe(from);
  });

  it.each([
    'https://example.com',
    'http://example.com',
    '//example.com',
    '///example.com',
    'javascript:alert(1)',
    '/\\example.com',
    '/\n/example.com',
    '/\t/example.com',
    '/ checkout',
    '/login',
    '/register',
    '/login/',
    '/LOGIN',
    '/register?from=checkout',
    '/games/../login',
  ])('should reject unsafe destination: %j', (from) => {
    expect(getAuthRedirect({ from })).toBe('/');
  });
});

describe('Role-based authentication redirects', () => {
  it.each([
    '/admin',
    '/admin/',
    '/ADMIN',
    '/Admin',
    '/admin?tab=gateways',
    '/admin#gateways',
    '/admin/payment-gateways',
    '/admin/payment-gateways?active=true',
    '/store/../admin',
  ])(
    'should redirect customers away from %s',
    (destination) => {
      expect(
        getAuthRedirect(
          { from: destination },
          false,
        ),
      ).toBe('/');
    },
  );

  it.each([
    '/admin',
    '/admin/',
    '/admin?tab=gateways',
    '/admin#gateways',
    '/admin/payment-gateways',
  ])(
    'should preserve administrative destination %s for admins',
    (destination) => {
      expect(
        getAuthRedirect(
          { from: destination },
          true,
        ),
      ).toBe(destination);
    },
  );

  it.each([
    '/',
    '/checkout',
    '/checkout?orderId=test-order',
    '/library',
    '/orders',
    '/games/cyberpunk-2077',
  ])(
    'should preserve customer destination %s',
    (destination) => {
      expect(
        getAuthRedirect(
          { from: destination },
          false,
        ),
      ).toBe(destination);
    },
  );

  it('should preserve the destination before authentication', () => {
    expect(
      getAuthRedirect({
        from: '/admin',
      }),
    ).toBe('/admin');
  });

  it('should reject external destinations even for administrators', () => {
    expect(
      getAuthRedirect(
        {
          from: 'https://example.com/admin',
        },
        true,
      ),
    ).toBe('/');
  });

  it('should reject authentication loops for administrators', () => {
    expect(
      getAuthRedirect(
        { from: '/login' },
        true,
      ),
    ).toBe('/');
  });

  it('should reject authentication loops for customers', () => {
    expect(
      getAuthRedirect(
        { from: '/register' },
        false,
      ),
    ).toBe('/');
  });
});
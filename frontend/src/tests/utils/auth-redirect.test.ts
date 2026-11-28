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
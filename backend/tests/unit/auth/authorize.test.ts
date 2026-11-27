import { describe, it, expect, vi } from 'vitest';

import type {
  Request,
  Response,
} from 'express';

import {
  authorize,
} from '../../../src/middlewares/authorize.middleware.js';

import {
  AppError,
} from '../../../src/errors/app.error.js';

type UserRole = 'CUSTOMER' | 'ADMIN';

describe('Authorization middleware', () => {
  function createRequest(role?: UserRole): Request {
    return {
        user: role
        ? {
            id: '88fd7aae-b35f-44da-9349-7d2f2e119834',
            role,
            }
        : undefined,
    } as unknown as Request;
    }

  const response = {} as Response;

  it('should allow administrators to access admin resources', () => {
    const req = createRequest('ADMIN');
    const next = vi.fn();

    const middleware = authorize('ADMIN');

    middleware(req, response, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });

  it('should deny customers access to admin resources', () => {
    const req = createRequest('CUSTOMER');
    const next = vi.fn();

    const middleware = authorize('ADMIN');

    expect(() => middleware(req, response, next))
      .toThrow(AppError);

    expect(() => middleware(req, response, next))
      .toThrow(
        'You do not have permission to access this resource'
      );

    expect(next).not.toHaveBeenCalled();
  });

  it('should allow customers to access customer resources', () => {
    const req = createRequest('CUSTOMER');
    const next = vi.fn();

    const middleware = authorize('CUSTOMER');

    middleware(req, response, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should deny administrators access to customer-only resources', () => {
    const req = createRequest('ADMIN');
    const next = vi.fn();

    const middleware = authorize('CUSTOMER');

    expect(() => middleware(req, response, next))
      .toThrow(AppError);

    expect(next).not.toHaveBeenCalled();
  });

  it.each([
    'CUSTOMER',
    'ADMIN',
  ] as const)('should allow multiple roles: %s', (role) => {
    const req = createRequest(role);
    const next = vi.fn();

    const middleware = authorize('CUSTOMER', 'ADMIN');

    middleware(req, response, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should reject unauthenticated requests', () => {
    const req = createRequest();
    const next = vi.fn();

    const middleware = authorize('ADMIN');

    expect(() => middleware(req, response, next))
      .toThrow('Authentication is required');

    expect(next).not.toHaveBeenCalled();
  });

  it('should return HTTP 401 for unauthenticated requests', () => {
    const req = createRequest();
    const next = vi.fn();

    const middleware = authorize('ADMIN');

    expect(() => middleware(req, response, next))
      .toThrow(
        expect.objectContaining({
          statusCode: 401,
          code: 'AUTHENTICATION_REQUIRED',
        })
      );
  });

  it('should return HTTP 403 for insufficient permissions', () => {
    const req = createRequest('CUSTOMER');
    const next = vi.fn();

    const middleware = authorize('ADMIN');

    expect(() => middleware(req, response, next))
      .toThrow(
        expect.objectContaining({
          statusCode: 403,
          code: 'FORBIDDEN',
        })
      );
  });

  it.each([
    'CUSTOMER',
    'ADMIN',
  ] as const)('should deny access when no roles are allowed: %s', (role) => {
    const req = createRequest(role);
    const next = vi.fn();

    const middleware = authorize();

    expect(() => middleware(req, response, next))
      .toThrow(AppError);

    expect(next).not.toHaveBeenCalled();
  });
});
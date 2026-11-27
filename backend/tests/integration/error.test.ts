import { describe, it, expect } from 'vitest';
import request from 'supertest';

import app from '../../src/app.js';

describe('Error handling', () => {
  it('should return 404 for an unknown route', async () => {
    const response = await request(app).get('/invalid-route');

    expect(response.status).toBe(404);

    expect(response.body).toEqual({
      error: {
        code: 'ROUTE_NOT_FOUND',
        message: 'Route not found',
      },
    });
  });

  it('should return errors as JSON', async () => {
    const response = await request(app).get('/invalid-route');

    expect(response.headers['content-type'])
      .toMatch(/application\/json/);
  });

  it('should return 400 for malformed JSON', async () => {
    const response = await request(app)
      .post('/health')
      .set('Content-Type', 'application/json')
      .send('{"invalid":');

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('INVALID_JSON');
  });
});
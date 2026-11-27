import { describe, it, expect } from 'vitest';
import request from 'supertest';

import app from '../../src/app.js';

describe('Health endpoint', () => {
  it('should return HTTP 200 and API health status', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      status: 'ok',
      service: 'gamevault-api',
    });
  });

  it('should return a JSON response', async () => {
    const response = await request(app).get('/health');

    expect(response.headers['content-type']).toMatch(/application\/json/);
  });
});
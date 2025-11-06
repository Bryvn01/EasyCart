/**
 * Integration tests for enhanced health check endpoints
 * Tests the actual health endpoint with live server
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');

describe('Enhanced Health Check Integration Tests', () => {

  afterAll(async () => {
    // Close mongoose connection after tests
    await mongoose.connection.close();
  });

  describe('GET /api/health', () => {
    test('Should return comprehensive health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect('Content-Type', /json/);

      // Should return either 200 (healthy) or 503 (unhealthy)
      expect([200, 503]).toContain(response.status);

      // Check response structure
      expect(response.body).toHaveProperty('status');
      expect(['UP', 'DOWN']).toContain(response.body.status);
      expect(response.body).toHaveProperty('service', 'easycart-nodejs-backend');
      expect(response.body).toHaveProperty('version', '1.0.0');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('components');
      expect(response.body).toHaveProperty('responseTime');

      // Check uptime structure
      expect(response.body.uptime).toHaveProperty('seconds');
      expect(response.body.uptime).toHaveProperty('readable');
      expect(typeof response.body.uptime.seconds).toBe('number');
      expect(typeof response.body.uptime.readable).toBe('string');

      // Check components structure
      expect(response.body.components).toHaveProperty('database');
      expect(response.body.components).toHaveProperty('memory');

      // Check database component
      const dbComponent = response.body.components.database;
      expect(dbComponent).toHaveProperty('status');
      expect(['UP', 'DOWN']).toContain(dbComponent.status);
      expect(dbComponent).toHaveProperty('details');

      // Check memory component
      const memoryComponent = response.body.components.memory;
      expect(memoryComponent).toHaveProperty('status');
      expect(['UP', 'DOWN', 'WARNING']).toContain(memoryComponent.status);
      expect(memoryComponent).toHaveProperty('details');
      expect(memoryComponent.details).toHaveProperty('heapUsed');
      expect(memoryComponent.details).toHaveProperty('heapTotal');
      expect(memoryComponent.details).toHaveProperty('external');
      expect(memoryComponent.details).toHaveProperty('usage');

      // Validate timestamp format (ISO 8601)
      expect(response.body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);

      // Validate response time format
      expect(response.body.responseTime).toMatch(/^\d+ms$/);
    });

    test('Should return health status quickly', async () => {
      const startTime = Date.now();

      await request(app)
        .get('/api/health')
        .expect('Content-Type', /json/);

      const duration = Date.now() - startTime;

      // Health check should respond in less than 2 seconds
      expect(duration).toBeLessThan(2000);
    });

    test('Should include database connection details when available', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect('Content-Type', /json/);

      const dbComponent = response.body.components.database;
      expect(dbComponent).toHaveProperty('details');
      expect(dbComponent.details).toHaveProperty('state');

      // State should be one of the mongoose connection states
      const validStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];
      expect(validStates).toContain(dbComponent.details.state);
    });

    test('Should report memory status correctly', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect('Content-Type', /json/);

      const memoryComponent = response.body.components.memory;
      const usage = parseInt(memoryComponent.details.usage);

      // Usage should be a valid percentage
      expect(usage).toBeGreaterThanOrEqual(0);
      expect(usage).toBeLessThanOrEqual(100);

      // Status should reflect usage
      if (usage >= 90) {
        expect(memoryComponent.status).toBe('WARNING');
      } else {
        expect(memoryComponent.status).toBe('UP');
      }
    });
  });
});

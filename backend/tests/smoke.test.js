/**
 * Basic Backend Smoke Test
 * Tests that don't require MongoDB connection
 */

const request = require('supertest');
const express = require('express');

describe('Backend Smoke Tests', () => {
  let app;

  beforeAll(() => {
    // Create a minimal app for testing
    app = express();
    app.use(express.json());

    // Mock health endpoint
    app.get('/api/health', (req, res) => {
      res.json({
        status: 'OK',
        message: 'EasyCart API is running',
        timestamp: new Date().toISOString()
      });
    });

    // Mock products endpoint with fallback data
    app.get('/api/products', (req, res) => {
      const fallbackProducts = [
        {
          _id: '1',
          id: '1',
          name: 'Test Product 1',
          price: 1000,
          category: 'Test',
          brand: 'Test Brand',
          description: 'Test description',
          image: 'test.jpg',
          stock: 10
        },
        {
          _id: '2',
          id: '2',
          name: 'Test Product 2',
          price: 2000,
          category: 'Test',
          brand: 'Test Brand',
          description: 'Test description',
          image: 'test2.jpg',
          stock: 5
        }
      ];

      res.json({
        success: true,
        data: fallbackProducts,
        pagination: {
          page: 1,
          limit: 20,
          total: 2,
          totalPages: 1
        }
      });
    });
  });

  test('Health endpoint returns OK', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect('Content-Type', /json/)
      .expect(200);

    // Updated to match enhanced health check format
    expect(response.body).toHaveProperty('status');
    expect(['OK', 'UP']).toContain(response.body.status);
    expect(response.body).toHaveProperty('timestamp');
  });

  test('Products endpoint returns data structure', async () => {
    const response = await request(app)
      .get('/api/products')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data');
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);

    // Check product structure
    const product = response.body.data[0];
    expect(product).toHaveProperty('name');
    expect(product).toHaveProperty('price');
    expect(product).toHaveProperty('category');
    expect(product).toHaveProperty('image');
    expect(product).toHaveProperty('stock');

    // Check pagination
    expect(response.body).toHaveProperty('pagination');
    expect(response.body.pagination).toHaveProperty('total');
    expect(response.body.pagination).toHaveProperty('page');
  });

  test('Seeding script exports required data', () => {
    const seedModule = require('../scripts/seedProducts.js');

    expect(seedModule).toHaveProperty('kenyanProducts');
    expect(seedModule).toHaveProperty('categories');
    expect(seedModule).toHaveProperty('seedProducts');

    // Check products structure
    expect(Array.isArray(seedModule.kenyanProducts)).toBe(true);
    expect(seedModule.kenyanProducts.length).toBeGreaterThan(0);

    // Check first product has required fields
    const firstProduct = seedModule.kenyanProducts[0];
    expect(firstProduct).toHaveProperty('name');
    expect(firstProduct).toHaveProperty('brand');
    expect(firstProduct).toHaveProperty('category');
    expect(firstProduct).toHaveProperty('price');
    expect(firstProduct).toHaveProperty('description');
    expect(firstProduct).toHaveProperty('sourceImageUrl');

    // Check categories structure
    expect(Array.isArray(seedModule.categories)).toBe(true);
    expect(seedModule.categories.length).toBeGreaterThan(0);
  });

  test('Product model is properly defined', () => {
    const Product = require('../models/Product');

    expect(Product).toBeDefined();
    expect(typeof Product).toBe('function');

    // Check schema definition
    const schema = Product.schema;
    expect(schema).toBeDefined();
    expect(schema.paths).toHaveProperty('name');
    expect(schema.paths).toHaveProperty('price');
    expect(schema.paths).toHaveProperty('category');
    expect(schema.paths).toHaveProperty('brand');
    expect(schema.paths).toHaveProperty('stock');
    expect(schema.paths).toHaveProperty('image');
  });

  test('Category model is properly defined', () => {
    const Category = require('../models/Category');

    expect(Category).toBeDefined();
    expect(typeof Category).toBe('function');

    // Check schema definition
    const schema = Category.schema;
    expect(schema).toBeDefined();
    expect(schema.paths).toHaveProperty('name');
    expect(schema.paths).toHaveProperty('description');
  });
});

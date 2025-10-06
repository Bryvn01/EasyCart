/**
 * Backend Products API Integration Test
 * 
 * This test validates that:
 * 1. Products can be seeded to MongoDB
 * 2. The /api/products endpoint returns the seeded products
 * 3. The response structure matches what the frontend expects
 */

const mongoose = require('mongoose');
const request = require('supertest');
const express = require('express');
const Product = require('../models/Product');
const Category = require('../models/Category');
const productRoutes = require('../routes/products');
require('dotenv').config();

// Create test app
const app = express();
app.use(express.json());
app.use('/api/products', productRoutes);

describe('Products API Integration Tests', () => {
  let server;

  // Setup: Connect to test database
  beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/easycart_test';
    await mongoose.connect(mongoUri);
    
    // Clear test database
    await Product.deleteMany({});
    await Category.deleteMany({});
    
    console.log('✅ Connected to test database');
  });

  // Teardown: Close database connection
  afterAll(async () => {
    await mongoose.connection.close();
    if (server) {
      server.close();
    }
    console.log('✅ Database connection closed');
  });

  describe('POST /api/products (seeding) and GET /api/products', () => {
    test('should seed products and retrieve them via API', async () => {
      // Step 1: Seed test products
      const testCategory = await Category.create({
        name: 'Test Category',
        description: 'Category for testing'
      });

      const testProducts = [
        {
          name: 'Test Product 1',
          brand: 'Test Brand',
          category: 'Test Category',
          price: 1000,
          description: 'First test product',
          image: 'https://example.com/test1.jpg',
          images: [{
            url: 'https://example.com/test1.jpg',
            alt: 'Test Product 1',
            isPrimary: true
          }],
          stock: 10,
          tags: ['test', 'product'],
          isActive: true,
          isFeatured: false
        },
        {
          name: 'Test Product 2',
          brand: 'Test Brand',
          category: 'Test Category',
          price: 2000,
          description: 'Second test product',
          image: 'https://example.com/test2.jpg',
          images: [{
            url: 'https://example.com/test2.jpg',
            alt: 'Test Product 2',
            isPrimary: true
          }],
          stock: 5,
          tags: ['test', 'product'],
          isActive: true,
          isFeatured: true
        }
      ];

      const createdProducts = await Product.insertMany(testProducts);
      expect(createdProducts).toHaveLength(2);
      console.log('✅ Seeded 2 test products');

      // Step 2: Fetch products via API
      const response = await request(app)
        .get('/api/products')
        .expect('Content-Type', /json/)
        .expect(200);

      // Step 3: Validate response structure
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      
      // Validate products data
      const products = response.body.data;
      expect(Array.isArray(products)).toBe(true);
      expect(products.length).toBeGreaterThanOrEqual(2);
      
      // Validate first product structure
      const product = products[0];
      expect(product).toHaveProperty('name');
      expect(product).toHaveProperty('price');
      expect(product).toHaveProperty('description');
      expect(product).toHaveProperty('category');
      expect(product).toHaveProperty('brand');
      expect(product).toHaveProperty('stock');
      
      // Validate image field exists (for frontend compatibility)
      expect(product).toHaveProperty('image');
      expect(typeof product.image).toBe('string');
      
      // Validate pagination
      const pagination = response.body.pagination;
      expect(pagination).toHaveProperty('total');
      expect(pagination.total).toBeGreaterThanOrEqual(2);
      expect(pagination).toHaveProperty('page');
      expect(pagination).toHaveProperty('totalPages');
      
      console.log('✅ API returned products correctly');
      console.log(`   Total: ${pagination.total} products`);
      console.log(`   Sample: ${product.name} - KES ${product.price}`);
    });

    test('should handle pagination correctly', async () => {
      const response = await request(app)
        .get('/api/products?page=1&limit=1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(1);
      expect(response.body.pagination).toHaveProperty('page', 1);
      expect(response.body.pagination).toHaveProperty('limit', 1);
      
      console.log('✅ Pagination works correctly');
    });

    test('should filter products by category', async () => {
      const response = await request(app)
        .get('/api/products?category=Test Category')
        .expect(200);

      expect(response.body.success).toBe(true);
      const products = response.body.data;
      
      // All products should be in the Test Category
      products.forEach(product => {
        expect(product.category).toBe('Test Category');
      });
      
      console.log('✅ Category filtering works correctly');
    });

    test('should search products by name', async () => {
      const response = await request(app)
        .get('/api/products?search=Test Product 1')
        .expect(200);

      expect(response.body.success).toBe(true);
      const products = response.body.data;
      
      // Should find the product with "Test Product 1" in the name
      expect(products.length).toBeGreaterThan(0);
      const found = products.some(p => p.name.includes('Test Product 1'));
      expect(found).toBe(true);
      
      console.log('✅ Search functionality works correctly');
    });

    test('should return empty array when no products match filters', async () => {
      const response = await request(app)
        .get('/api/products?category=NonExistentCategory')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
      expect(response.body.pagination.total).toBe(0);
      
      console.log('✅ Empty result handling works correctly');
    });
  });

  describe('GET /api/products/:id', () => {
    test('should retrieve a single product by ID', async () => {
      // Get a product ID from the database
      const product = await Product.findOne();
      expect(product).not.toBeNull();

      const response = await request(app)
        .get(`/api/products/${product._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('name', product.name);
      expect(response.body.data).toHaveProperty('price', product.price);
      
      console.log('✅ Single product retrieval works correctly');
    });

    test('should return 404 for non-existent product', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/products/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/not found/i);
      
      console.log('✅ 404 handling works correctly');
    });
  });
});


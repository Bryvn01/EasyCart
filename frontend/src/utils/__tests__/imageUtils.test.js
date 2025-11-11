import { normalizeImageUrl, getProductImageUrl, preloadImage } from '../imageUtils';

describe('imageUtils', () => {
  const originalEnv = process.env.REACT_APP_API_URL;

  beforeEach(() => {
    process.env.REACT_APP_API_URL = 'https://example.com/api';
  });

  afterEach(() => {
    process.env.REACT_APP_API_URL = originalEnv;
  });

  describe('normalizeImageUrl', () => {
    it('returns null for falsy values', () => {
      expect(normalizeImageUrl(null)).toBeNull();
      expect(normalizeImageUrl(undefined)).toBeNull();
      expect(normalizeImageUrl('')).toBeNull();
    });

    it('returns URL as-is for full http URLs', () => {
      const url = 'http://example.com/image.jpg';
      expect(normalizeImageUrl(url)).toBe(url);
    });

    it('returns URL as-is for full https URLs', () => {
      const url = 'https://example.com/image.jpg';
      expect(normalizeImageUrl(url)).toBe(url);
    });

    it('decodes URL-encoded characters', () => {
      const encoded = 'https%3A//example.com/image.jpg';
      expect(normalizeImageUrl(encoded)).toBe('https://example.com/image.jpg');
    });

    it('handles malformed /media/http URLs', () => {
      const malformed = '/media/https://cloudinary.com/image.jpg';
      expect(normalizeImageUrl(malformed)).toBe('https://cloudinary.com/image.jpg');
    });

    it('handles malformed /media/http: URLs without slashes', () => {
      const malformed = '/media/https:example.com/image.jpg';
      expect(normalizeImageUrl(malformed)).toBe('https://example.com/image.jpg');
    });

    it('prepends base URL for relative paths starting with /', () => {
      const relative = '/media/products/image.jpg';
      expect(normalizeImageUrl(relative)).toBe('https://example.com/media/products/image.jpg');
    });

    it('returns relative paths without slash as-is', () => {
      const relative = 'images/product.jpg';
      expect(normalizeImageUrl(relative)).toBe('images/product.jpg');
    });

    it('handles decoding errors gracefully', () => {
      // Create a URL that will fail decoding
      const invalidEncoded = '%E0%A4%A';
      const result = normalizeImageUrl(invalidEncoded);
      expect(result).toBe(invalidEncoded);
    });
  });

  describe('getProductImageUrl', () => {
    it('returns fallback for null product', () => {
      expect(getProductImageUrl(null)).toBe('/placeholder.png');
    });

    it('returns fallback for undefined product', () => {
      expect(getProductImageUrl(undefined)).toBe('/placeholder.png');
    });

    it('returns custom fallback when provided', () => {
      expect(getProductImageUrl(null, '/custom-fallback.jpg')).toBe('/custom-fallback.jpg');
    });

    it('uses product.image if available', () => {
      const product = { image: 'https://example.com/image.jpg' };
      expect(getProductImageUrl(product)).toBe('https://example.com/image.jpg');
    });

    it('uses product.image_url if image is not available', () => {
      const product = { image_url: 'https://example.com/image.jpg' };
      expect(getProductImageUrl(product)).toBe('https://example.com/image.jpg');
    });

    it('prefers product.image over product.image_url', () => {
      const product = {
        image: 'https://example.com/image1.jpg',
        image_url: 'https://example.com/image2.jpg'
      };
      expect(getProductImageUrl(product)).toBe('https://example.com/image1.jpg');
    });

    it('normalizes the image URL', () => {
      const product = { image: '/media/products/image.jpg' };
      expect(getProductImageUrl(product)).toBe('https://example.com/media/products/image.jpg');
    });

    it('returns fallback if product has no image fields', () => {
      const product = { id: 1, name: 'Product' };
      expect(getProductImageUrl(product)).toBe('/placeholder.png');
    });
  });

  describe('preloadImage', () => {
    beforeEach(() => {
      // Mock Image constructor
      global.Image = jest.fn().mockImplementation(function() {
        this.onload = null;
        this.onerror = null;
        this.src = '';
      });
    });

    it('resolves when image loads successfully', async () => {
      const url = 'https://example.com/image.jpg';
      const promise = preloadImage(url);

      // Get the most recently created Image instance
      const mockImage = global.Image.mock.instances[global.Image.mock.instances.length - 1];
      
      // Trigger onload
      if (mockImage.onload) {
        mockImage.onload();
      }

      await expect(promise).resolves.toBe(url);
    });

    it('rejects when image fails to load', async () => {
      const url = 'https://example.com/broken.jpg';
      const promise = preloadImage(url);

      // Get the most recently created Image instance
      const mockImage = global.Image.mock.instances[global.Image.mock.instances.length - 1];
      
      // Trigger onerror
      if (mockImage.onerror) {
        mockImage.onerror();
      }

      await expect(promise).rejects.toThrow(`Failed to load image: ${url}`);
    });

    it('sets correct src on Image object', () => {
      const url = 'https://example.com/image.jpg';
      preloadImage(url);

      const mockImage = global.Image.mock.instances[global.Image.mock.instances.length - 1];
      expect(mockImage.src).toBe(url);
    });
  });
});

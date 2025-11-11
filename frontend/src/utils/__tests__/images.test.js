import { optimizeImage, imageFallback, getImageSizes } from '../images';

describe('images utilities', () => {
  describe('optimizeImage', () => {
    it('returns placeholder for null or undefined URLs', () => {
      expect(optimizeImage(null)).toBe('/images/placeholder-product.jpg');
      expect(optimizeImage(undefined)).toBe('/images/placeholder-product.jpg');
      expect(optimizeImage('')).toBe('/images/placeholder-product.jpg');
    });

    it('returns URL as-is for external http URLs', () => {
      const url = 'http://example.com/image.jpg';
      expect(optimizeImage(url)).toBe(url);
    });

    it('returns URL as-is for external https URLs', () => {
      const url = 'https://example.com/image.jpg';
      expect(optimizeImage(url)).toBe(url);
    });

    it('returns URL as-is for Cloudinary URLs', () => {
      const url = 'https://res.cloudinary.com/demo/image.jpg';
      expect(optimizeImage(url)).toBe(url);
    });

    it('returns URL as-is for paths starting with /', () => {
      const url = '/media/products/image.jpg';
      expect(optimizeImage(url)).toBe(url);
    });

    it('prepends /images/products/ for relative paths', () => {
      expect(optimizeImage('image.jpg')).toBe('/images/products/image.jpg');
      expect(optimizeImage('subfolder/image.jpg')).toBe('/images/products/subfolder/image.jpg');
    });

    it('accepts custom width and height parameters', () => {
      // Width and height don't affect return value in current implementation
      // but should be accepted
      expect(optimizeImage('image.jpg', 800, 600)).toBe('/images/products/image.jpg');
    });
  });

  describe('imageFallback', () => {
    let mockEvent;

    beforeEach(() => {
      mockEvent = {
        target: {
          src: '',
          onerror: jest.fn()
        }
      };
    });

    it('sets product fallback by default', () => {
      imageFallback(mockEvent);
      expect(mockEvent.target.src).toBe('/images/placeholder-product.jpg');
      expect(mockEvent.target.onerror).toBeNull();
    });

    it('sets correct fallback for product category', () => {
      imageFallback(mockEvent, 'product');
      expect(mockEvent.target.src).toBe('/images/placeholder-product.jpg');
    });

    it('sets correct fallback for hero category', () => {
      imageFallback(mockEvent, 'hero');
      expect(mockEvent.target.src).toBe('/images/placeholder-hero.jpg');
    });

    it('sets correct fallback for icon category', () => {
      imageFallback(mockEvent, 'icon');
      expect(mockEvent.target.src).toBe('/images/placeholder-icon.jpg');
    });

    it('sets correct fallback for category category', () => {
      imageFallback(mockEvent, 'category');
      expect(mockEvent.target.src).toBe('/images/placeholder-category.jpg');
    });

    it('uses product fallback for unknown category', () => {
      imageFallback(mockEvent, 'unknown');
      expect(mockEvent.target.src).toBe('/images/placeholder-product.jpg');
    });

    it('prevents infinite error loop by setting onerror to null', () => {
      mockEvent.target.onerror = jest.fn();
      imageFallback(mockEvent);
      expect(mockEvent.target.onerror).toBeNull();
    });
  });

  describe('getImageSizes', () => {
    it('returns simple src object for null/undefined URLs', () => {
      expect(getImageSizes(null)).toEqual({ src: null });
      expect(getImageSizes(undefined)).toEqual({ src: undefined });
    });

    it('returns simple src object for local /images/ paths', () => {
      const url = '/images/placeholder.jpg';
      expect(getImageSizes(url)).toEqual({ src: url });
    });

    it('generates srcSet for external URLs', () => {
      const baseUrl = 'https://example.com/image.jpg';
      const result = getImageSizes(baseUrl);
      
      expect(result.src).toBe(baseUrl);
      expect(result.srcSet).toContain('400w');
      expect(result.srcSet).toContain('600w');
      expect(result.srcSet).toContain('800w');
      expect(result.sizes).toBe('(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw');
    });

    it('uses custom sizes array when provided', () => {
      const baseUrl = 'https://example.com/image.jpg';
      const customSizes = [200, 400, 800, 1600];
      const result = getImageSizes(baseUrl, customSizes);
      
      expect(result.srcSet).toContain('200w');
      expect(result.srcSet).toContain('400w');
      expect(result.srcSet).toContain('800w');
      expect(result.srcSet).toContain('1600w');
    });

    it('generates correct srcSet format', () => {
      const baseUrl = 'https://example.com/image.jpg';
      const result = getImageSizes(baseUrl, [400, 800]);
      
      expect(result.srcSet).toBe('https://example.com/image.jpg?width=400 400w, https://example.com/image.jpg?width=800 800w');
    });

    it('includes standard sizes attribute for responsive images', () => {
      const baseUrl = 'https://example.com/image.jpg';
      const result = getImageSizes(baseUrl);
      
      expect(result.sizes).toBeTruthy();
      expect(result.sizes).toContain('max-width');
      expect(result.sizes).toContain('vw');
    });
  });
});

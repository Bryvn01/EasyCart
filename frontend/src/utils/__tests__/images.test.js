import { 
  getCloudinaryUrl, 
  generateResponsiveSizes,
  isValidImageUrl,
  getConnectionQuality,
  getConnectionAwareImage
} from '../images';

describe('Image Utilities', () => {
  describe('getCloudinaryUrl', () => {
    it('should return placeholder for empty URL', () => {
      const result = getCloudinaryUrl('');
      expect(result).toBe('/images/placeholder-product.jpg');
    });

    it('should return placeholder image as-is', () => {
      const url = '/images/placeholder-product.jpg';
      const result = getCloudinaryUrl(url);
      expect(result).toBe(url);
    });

    it('should return local images as-is', () => {
      const url = '/images/test.jpg';
      const result = getCloudinaryUrl(url);
      expect(result).toBe(url);
    });

    it('should return non-Cloudinary URLs as-is', () => {
      const url = 'https://example.com/image.jpg';
      const result = getCloudinaryUrl(url);
      expect(result).toBe(url);
    });

    it('should add transformations to Cloudinary URL', () => {
      const url = 'https://res.cloudinary.com/demo/image/upload/sample.jpg';
      const result = getCloudinaryUrl(url, { width: 400, height: 300, quality: 80 });
      
      expect(result).toContain('w_400');
      expect(result).toContain('h_300');
      expect(result).toContain('q_80');
    });
  });

  describe('isValidImageUrl', () => {
    it('should return false for empty URL', () => {
      expect(isValidImageUrl('')).toBe(false);
    });

    it('should validate common image URLs', () => {
      expect(isValidImageUrl('https://example.com/image.jpg')).toBe(true);
      expect(isValidImageUrl('https://example.com/image.png')).toBe(true);
    });

    it('should validate Cloudinary URLs', () => {
      expect(isValidImageUrl('https://res.cloudinary.com/demo/image/upload/sample.jpg')).toBe(true);
    });
  });
});

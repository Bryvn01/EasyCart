import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ImageWithFallback from '../components/ImageWithFallback';

describe('ImageWithFallback Component', () => {
  const mockSrc = 'https://example.com/image.jpg';
  const mockAlt = 'Test image';
  const mockFallbackSrc = '/images/fallback.jpg';

  beforeEach(() => {
    // Reset environment variables
    process.env.REACT_APP_IMAGE_BASE_URL = 'http://localhost:8000';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders image with correct src and alt', () => {
      render(<ImageWithFallback src={mockSrc} alt={mockAlt} lazy={false} showSkeleton={false} />);
      const image = screen.getByAltText(mockAlt);
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', mockSrc);
    });

    it('applies custom className', () => {
      const className = 'custom-image-class';
      render(
        <ImageWithFallback
          src={mockSrc}
          alt={mockAlt}
          className={className}
          lazy={false}
          showSkeleton={false}
        />
      );
      const image = screen.getByAltText(mockAlt);
      expect(image).toHaveClass(className);
    });

    it('applies custom width and height', () => {
      render(
        <ImageWithFallback
          src={mockSrc}
          alt={mockAlt}
          width={300}
          height={200}
          lazy={false}
          showSkeleton={false}
        />
      );
      const image = screen.getByAltText(mockAlt);
      expect(image).toHaveAttribute('width', '300');
      expect(image).toHaveAttribute('height', '200');
    });

    it('applies custom style', () => {
      const style = { borderRadius: '10px' };
      render(
        <ImageWithFallback
          src={mockSrc}
          alt={mockAlt}
          style={style}
          lazy={false}
          showSkeleton={false}
        />
      );
      const image = screen.getByAltText(mockAlt);
      expect(image).toHaveStyle({ borderRadius: '10px' });
    });
  });

  describe('Skeleton Loading State', () => {
    it('shows skeleton loader while image is loading', () => {
      render(<ImageWithFallback src={mockSrc} alt={mockAlt} showSkeleton={true} lazy={false} />);
      const skeleton = screen.getByLabelText(`Loading ${mockAlt}`);
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toHaveClass('animate-pulse');
    });

    it('hides skeleton after image loads', async () => {
      render(<ImageWithFallback src={mockSrc} alt={mockAlt} showSkeleton={true} lazy={false} />);

      const image = screen.getByAltText(mockAlt);
      fireEvent.load(image);

      await waitFor(() => {
        expect(screen.queryByLabelText(`Loading ${mockAlt}`)).not.toBeInTheDocument();
      });
    });

    it('applies custom skeleton className', () => {
      const skeletonClassName = 'custom-skeleton';
      render(
        <ImageWithFallback
          src={mockSrc}
          alt={mockAlt}
          showSkeleton={true}
          skeletonClassName={skeletonClassName}
          lazy={false}
        />
      );
      const skeleton = screen.getByLabelText(`Loading ${mockAlt}`);
      expect(skeleton).toHaveClass(skeletonClassName);
    });
  });

  describe('Error Handling', () => {
    it('shows fallback image on error', async () => {
      render(
        <ImageWithFallback
          src={mockSrc}
          alt={mockAlt}
          fallbackSrc={mockFallbackSrc}
          lazy={false}
          showSkeleton={false}
          retryCount={0}
        />
      );

      const image = screen.getByAltText(mockAlt);
      fireEvent.error(image);

      await waitFor(() => {
        expect(image).toHaveAttribute('src', mockFallbackSrc);
      });
    });

    it('uses default fallback for product category', async () => {
      render(
        <ImageWithFallback
          src={mockSrc}
          alt={mockAlt}
          fallbackCategory="product"
          lazy={false}
          showSkeleton={false}
          retryCount={0}
        />
      );

      const image = screen.getByAltText(mockAlt);
      fireEvent.error(image);

      await waitFor(() => {
        expect(image).toHaveAttribute('src', '/images/placeholder-product.jpg');
      });
    });

    it('uses default fallback for category', async () => {
      render(
        <ImageWithFallback
          src={mockSrc}
          alt={mockAlt}
          fallbackCategory="category"
          lazy={false}
          showSkeleton={false}
          retryCount={0}
        />
      );

      const image = screen.getByAltText(mockAlt);
      fireEvent.error(image);

      await waitFor(() => {
        expect(image).toHaveAttribute('src', '/images/placeholder-category.jpg');
      });
    });

    it('shows error state when all fallbacks fail', async () => {
      render(
        <ImageWithFallback
          src={mockSrc}
          alt={mockAlt}
          fallbackSrc={mockFallbackSrc}
          lazy={false}
          showSkeleton={false}
          retryCount={0}
        />
      );

      const image = screen.getByAltText(mockAlt);

      // First error - should use fallback
      fireEvent.error(image);

      await waitFor(() => {
        expect(image).toHaveAttribute('src', mockFallbackSrc);
      });

      // Second error - should show error state
      fireEvent.error(image);

      await waitFor(() => {
        expect(screen.getByText('Image unavailable')).toBeInTheDocument();
      });
    });

    it('calls onError callback', async () => {
      const onError = jest.fn();
      render(
        <ImageWithFallback
          src={mockSrc}
          alt={mockAlt}
          onError={onError}
          lazy={false}
          showSkeleton={false}
          retryCount={0}
        />
      );

      const image = screen.getByAltText(mockAlt);

      // First error triggers fallback
      fireEvent.error(image);

      await waitFor(() => {
        expect(image).toHaveAttribute('src', '/images/placeholder-product.jpg');
      });

      // Second error should call onError
      fireEvent.error(image);

      await waitFor(() => {
        expect(onError).toHaveBeenCalled();
      });
    });
  });

  describe('Image URL Resolution', () => {
    it('resolves absolute URLs correctly', () => {
      render(
        <ImageWithFallback
          src="https://example.com/image.jpg"
          alt={mockAlt}
          lazy={false}
          showSkeleton={false}
        />
      );
      const image = screen.getByAltText(mockAlt);
      expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
    });

    it('resolves local paths correctly', () => {
      render(
        <ImageWithFallback
          src="/images/local-image.jpg"
          alt={mockAlt}
          lazy={false}
          showSkeleton={false}
        />
      );
      const image = screen.getByAltText(mockAlt);
      expect(image).toHaveAttribute('src', '/images/local-image.jpg');
    });

    it('prepends IMAGE_BASE_URL for backend images', () => {
      process.env.REACT_APP_IMAGE_BASE_URL = 'https://cdn.example.com';
      render(
        <ImageWithFallback
          src="products/image.jpg"
          alt={mockAlt}
          lazy={false}
          showSkeleton={false}
        />
      );
      const image = screen.getByAltText(mockAlt);
      expect(image).toHaveAttribute('src', 'https://cdn.example.com/products/image.jpg');
    });

    it('handles data URLs correctly', () => {
      const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      render(
        <ImageWithFallback
          src={dataUrl}
          alt={mockAlt}
          lazy={false}
          showSkeleton={false}
        />
      );
      const image = screen.getByAltText(mockAlt);
      expect(image).toHaveAttribute('src', dataUrl);
    });
  });

  describe('Lazy Loading', () => {
    it('sets loading="lazy" when lazy prop is true', () => {
      render(
        <ImageWithFallback
          src={mockSrc}
          alt={mockAlt}
          lazy={true}
          showSkeleton={false}
        />
      );
      const image = screen.getByAltText(mockAlt);
      expect(image).toHaveAttribute('loading', 'lazy');
    });

    it('sets loading="eager" when lazy prop is false', () => {
      render(
        <ImageWithFallback
          src={mockSrc}
          alt={mockAlt}
          lazy={false}
          showSkeleton={false}
        />
      );
      const image = screen.getByAltText(mockAlt);
      expect(image).toHaveAttribute('loading', 'eager');
    });

    it('uses data-src for lazy loading', () => {
      render(
        <ImageWithFallback
          src={mockSrc}
          alt={mockAlt}
          lazy={true}
          showSkeleton={true}
        />
      );
      const image = screen.getByAltText(mockAlt);
      expect(image).toHaveAttribute('data-src', mockSrc);
    });
  });

  describe('Callbacks', () => {
    it('calls onLoad callback when image loads', async () => {
      const onLoad = jest.fn();
      render(
        <ImageWithFallback
          src={mockSrc}
          alt={mockAlt}
          onLoad={onLoad}
          lazy={false}
          showSkeleton={false}
        />
      );

      const image = screen.getByAltText(mockAlt);
      fireEvent.load(image);

      await waitFor(() => {
        expect(onLoad).toHaveBeenCalled();
      });
    });
  });

  describe('PropTypes Validation', () => {
    it('renders with all valid prop types', () => {
      const { container } = render(
        <ImageWithFallback
          src={mockSrc}
          alt={mockAlt}
          fallbackSrc={mockFallbackSrc}
          fallbackCategory="product"
          className="test-class"
          width={400}
          height={300}
          lazy={true}
          showSkeleton={true}
          skeletonClassName="skeleton-class"
          onLoad={jest.fn()}
          onError={jest.fn()}
          style={{ margin: '10px' }}
          retryCount={2}
          retryDelay={500}
          performanceMonitoring={false}
        />
      );
      expect(container).toBeInTheDocument();
    });
  });

  describe('Source Updates', () => {
    it('updates image when src prop changes', async () => {
      const { rerender } = render(
        <ImageWithFallback
          src={mockSrc}
          alt={mockAlt}
          lazy={false}
          showSkeleton={false}
        />
      );

      const image = screen.getByAltText(mockAlt);
      expect(image).toHaveAttribute('src', mockSrc);

      const newSrc = 'https://example.com/new-image.jpg';
      rerender(
        <ImageWithFallback
          src={newSrc}
          alt={mockAlt}
          lazy={false}
          showSkeleton={false}
        />
      );

      await waitFor(() => {
        expect(image).toHaveAttribute('src', newSrc);
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper aria-label for skeleton loader', () => {
      render(<ImageWithFallback src={mockSrc} alt={mockAlt} showSkeleton={true} lazy={false} />);
      const skeleton = screen.getByLabelText(`Loading ${mockAlt}`);
      expect(skeleton).toBeInTheDocument();
    });

    it('has proper role and aria-label for error state', async () => {
      render(
        <ImageWithFallback
          src={mockSrc}
          alt={mockAlt}
          fallbackSrc={mockFallbackSrc}
          lazy={false}
          showSkeleton={false}
          retryCount={0}
        />
      );

      const image = screen.getByAltText(mockAlt);

      // Trigger both errors to reach error state
      fireEvent.error(image);
      await waitFor(() => {
        expect(image).toHaveAttribute('src', mockFallbackSrc);
      });

      fireEvent.error(image);

      await waitFor(() => {
        const errorElement = screen.getByRole('img', { name: mockAlt });
        expect(errorElement).toBeInTheDocument();
      });
    });
  });
});

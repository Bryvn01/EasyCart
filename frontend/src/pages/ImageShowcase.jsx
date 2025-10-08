import React, { useState } from 'react';
import ImageWithFallback from '../components/ImageWithFallback';
import { getConnectionQuality, getCloudinaryUrl } from '../utils/images';

/**
 * ImageShowcase Component
 * Demonstrates various features of the ImageWithFallback component
 */
const ImageShowcase = () => {
  const [connectionQuality, setConnectionQuality] = useState(getConnectionQuality());

  // Sample Cloudinary image
  const sampleImage = 'https://res.cloudinary.com/demo/image/upload/sample.jpg';

  React.useEffect(() => {
    // Update connection quality periodically
    const interval = setInterval(() => {
      setConnectionQuality(getConnectionQuality());
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Image Management System Demo</h1>
      
      {/* Connection Info */}
      <div className="mb-8 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Connection Information</h2>
        <p className="text-sm text-gray-700">
          Current connection quality: <span className="font-semibold">{connectionQuality}</span>
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Images will automatically adjust quality based on your connection speed
        </p>
      </div>

      {/* Basic Image */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">1. Basic Image Loading</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-medium mb-2">With Skeleton Loader</h3>
            <div className="h-64 bg-gray-100 rounded-lg overflow-hidden">
              <ImageWithFallback
                src={sampleImage}
                alt="Sample image with skeleton"
                showSkeleton={true}
                width={400}
                height={400}
              />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">Without Skeleton</h3>
            <div className="h-64 bg-gray-100 rounded-lg overflow-hidden">
              <ImageWithFallback
                src={sampleImage}
                alt="Sample image without skeleton"
                width={400}
                height={400}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Lazy Loading */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">2. Lazy Loading Demo</h2>
        <p className="text-gray-600 mb-4">
          Scroll down to see these images load only when they come into view
        </p>
        <div className="space-y-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 bg-gray-100 rounded-lg overflow-hidden">
              <ImageWithFallback
                src={`${sampleImage}?v=${i}`}
                alt={`Lazy loaded image ${i}`}
                lazy={true}
                showSkeleton={true}
                width={800}
                height={400}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Progressive Loading */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">3. Progressive Loading (Blur-up)</h2>
        <p className="text-gray-600 mb-4">
          Images load with a low-quality blur first, then transition to high quality
        </p>
        <div className="h-96 bg-gray-100 rounded-lg overflow-hidden">
          <ImageWithFallback
            src={`${sampleImage}?blur=0`}
            alt="Progressive loading demo"
            progressive={true}
            showSkeleton={true}
            width={800}
            height={600}
          />
        </div>
      </section>

      {/* Responsive Images */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">4. Responsive Images</h2>
        <p className="text-gray-600 mb-4">
          Images automatically serve different sizes based on screen size
        </p>
        <div className="h-96 bg-gray-100 rounded-lg overflow-hidden">
          <ImageWithFallback
            src={sampleImage}
            alt="Responsive image demo"
            responsive={true}
            showSkeleton={true}
            width={1200}
            height={800}
          />
        </div>
      </section>

      {/* Error Handling */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">5. Error Handling & Retry</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Broken URL (with retry)</h3>
            <div className="h-48 bg-gray-100 rounded-lg overflow-hidden">
              <ImageWithFallback
                src="https://broken-url.com/image.jpg"
                alt="Broken image with retry"
                fallbackCategory="product"
                showSkeleton={true}
                retryCount={3}
              />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">Hero Fallback</h3>
            <div className="h-48 bg-gray-100 rounded-lg overflow-hidden">
              <ImageWithFallback
                src="https://broken-url.com/hero.jpg"
                alt="Hero fallback"
                fallbackCategory="hero"
                showSkeleton={true}
              />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">Category Fallback</h3>
            <div className="h-48 bg-gray-100 rounded-lg overflow-hidden">
              <ImageWithFallback
                src="https://broken-url.com/category.jpg"
                alt="Category fallback"
                fallbackCategory="category"
                showSkeleton={true}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Optimized URLs */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">6. URL Optimization Examples</h2>
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div>
            <h3 className="font-medium mb-2">Original URL:</h3>
            <code className="text-xs bg-white p-2 rounded block overflow-x-auto">
              {sampleImage}
            </code>
          </div>
          <div>
            <h3 className="font-medium mb-2">Optimized (400x400, auto quality):</h3>
            <code className="text-xs bg-white p-2 rounded block overflow-x-auto">
              {getCloudinaryUrl(sampleImage, { width: 400, height: 400, quality: 'auto' })}
            </code>
          </div>
          <div>
            <h3 className="font-medium mb-2">Thumbnail (150x150, low quality):</h3>
            <code className="text-xs bg-white p-2 rounded block overflow-x-auto">
              {getCloudinaryUrl(sampleImage, { width: 150, height: 150, quality: 50 })}
            </code>
          </div>
          <div>
            <h3 className="font-medium mb-2">Blur placeholder (50x50, blur 100):</h3>
            <code className="text-xs bg-white p-2 rounded block overflow-x-auto">
              {getCloudinaryUrl(sampleImage, { width: 50, quality: 10, blur: 100 })}
            </code>
          </div>
        </div>
      </section>

      {/* Best Practices */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">7. Best Practices</h2>
        <div className="bg-green-50 p-6 rounded-lg">
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <div>
                <strong>Always use lazy loading for images below the fold</strong>
                <p className="text-sm text-gray-600">Improves initial page load time significantly</p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <div>
                <strong>Enable skeleton loaders for better perceived performance</strong>
                <p className="text-sm text-gray-600">Users feel the page is loading faster</p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <div>
                <strong>Use progressive loading for hero images</strong>
                <p className="text-sm text-gray-600">Provides immediate visual feedback</p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <div>
                <strong>Specify width and height for optimization</strong>
                <p className="text-sm text-gray-600">Cloudinary can deliver perfectly sized images</p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <div>
                <strong>Always provide fallback categories</strong>
                <p className="text-sm text-gray-600">Ensures graceful handling of broken images</p>
              </div>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default ImageShowcase;

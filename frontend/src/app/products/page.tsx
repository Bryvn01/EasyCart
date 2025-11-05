'use client';

import React, { useState, useEffect } from 'react';

/**
 * ProductList Component
 * Displays a grid of products with image, name, price, and add to cart button
 */
interface Product {
  id: string | number;
  name: string;
  price: number;
  description?: string;
  image?: string;
  image_url?: string;
  category?: string;
  category_name?: string;
  stock?: number;
}

interface ProductListProps {
  products: Product[];
}

const ProductList: React.FC<ProductListProps> = ({ products }) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 text-5xl mb-4">📦</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No products available</h3>
        <p className="text-gray-600">Check back later for new products!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {products.map((product) => (
        <div
          key={product.id}
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
        >
          {/* Product Image */}
          <div className="h-48 bg-gray-200 flex items-center justify-center overflow-hidden">
            {product.image || product.image_url ? (
              <img
                src={product.image || product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  if (target.nextElementSibling) {
                    (target.nextElementSibling as HTMLElement).style.display = 'flex';
                  }
                }}
              />
            ) : null}
            <div
              className="w-full h-full flex items-center justify-center text-gray-400 text-4xl"
              style={{ display: product.image || product.image_url ? 'none' : 'flex' }}
            >
              📦
            </div>
          </div>

          {/* Product Info */}
          <div className="p-4">
            {/* Category */}
            {product.category && (
              <div className="text-xs text-primary font-semibold mb-1">
                {product.category_name || product.category}
              </div>
            )}

            {/* Product Name */}
            <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2" title={product.name}>
              {product.name}
            </h3>

            {/* Price */}
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-gray-900">
                KSh {product.price?.toLocaleString() || '0'}
              </span>

              {/* Stock Status */}
              {product.stock !== undefined && (
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}
                >
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">{product.description}</p>
            )}

            {/* Add to Cart Button */}
            <button
              className="w-full mt-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={product.stock === 0}
            >
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Products Page Component
 * Fetches product data from the Django REST backend and displays them
 */
export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get API URL from environment variable with fallback
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL ||
          (typeof window !== 'undefined' && window.location.hostname === 'localhost'
            ? 'http://localhost:8000/api'
            : 'https://easycart-j6ue.onrender.com/api');

        console.log('Fetching products from:', `${apiUrl}/products/`);

        const response = await fetch(`${apiUrl}/products/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store', // Ensure fresh data on each request
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('API Response:', data);

        // Unwrap the results array from paginated DRF response
        // Handle both DRF pagination format and direct array format
        const productsData = data.results || data.data || data;

        if (Array.isArray(productsData)) {
          setProducts(productsData);
        } else if (typeof productsData === 'object' && productsData !== null) {
          // If it's an object, check if it has a results or data property
          setProducts([]);
          console.error('Unexpected data format:', productsData);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-red-600 mb-2">Error Loading Products</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Our Products</h1>
      <ProductList products={products} />
    </div>
  );
}

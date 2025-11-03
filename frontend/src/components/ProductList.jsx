import React, { useState } from 'react';
import { productsAPI, getApiBaseUrl } from '../services/api';
import { handleApiError, retryWithBackoff, getDetailedErrorMessage, checkApiHealth } from '../utils/errorHandler';
import { ProductGridSkeleton } from './ui';
import ProductCard from './ProductCard';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';

/**
 * ProductList Component
 * Fetches and displays products from the backend API with enhanced error handling
 */

const fetchProducts = async () => {
  const apiBaseUrl = getApiBaseUrl();
  const isHealthy = await checkApiHealth(apiBaseUrl);
  if (!isHealthy && process.env.NODE_ENV === 'development') {
    console.warn('API health check failed, but continuing with request...');
  }
  const response = await retryWithBackoff(
    async () => productsAPI.getProducts(),
    2,
    1500
  );
  const productsData = response.data.results || response.data;
  return Array.isArray(productsData) ? productsData : [];
};

const ProductList = () => {
  const { t } = useTranslation();
  const [addingToCart, setAddingToCart] = useState({});
  let isAuthenticated = false;
  let fetchCartCount = () => {};
  try {
    const auth = useAuth();
    isAuthenticated = auth && auth.isAuthenticated;
  } catch (e) {}
  try {
    const cart = useCart();
    fetchCartCount = cart && cart.fetchCartCount ? cart.fetchCartCount : () => {};
  } catch (e) {}

  const {
    data: products,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery(['products'], fetchProducts, {
    retry: 2,
    refetchOnWindowFocus: false,
  });

  // Restore handleAddToCart
  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      handleApiError({ message: t('pleaseLoginToAdd', 'Please login to add items to cart') });
      return;
    }
    setAddingToCart((prev) => ({ ...prev, [product.id]: true }));
    let success = false;
    try {
      // Simulate API call or add your API logic here
      // await ordersAPI.addToCart({ product_id: product.id, quantity: 1 });
      if (fetchCartCount) fetchCartCount();
      // handleApiSuccess(t('productAdded', 'Product added to cart! 🛒'));
      success = true;
    } catch (error) {
      handleApiError(error, t('failedToAdd', 'Failed to add product to cart'));
    } finally {
      setTimeout(() => {
        setAddingToCart((prev) => ({ ...prev, [product.id]: false }));
      }, success ? 400 : 0);
    }
  };

  if (isLoading) {
    return <ProductGridSkeleton count={8} />;
  }

  if (isError) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="text-red-500 text-5xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-red-600 mb-2">{t('errorLoadingProducts', 'Error Loading Products')}</h3>
        <p className="text-gray-600 mb-4">{error?.message || t('unknownError', 'An unknown error occurred.')}</p>
        <button
          onClick={() => refetch()}
          className="mt-4 px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition"
        >
          {t('tryAgain', 'Try Again')}
        </button>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 text-5xl mb-4">📦</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">{t('noProductsAvailable', 'No products available')}</h3>
        <p className="text-gray-600">{t('checkBackLater', 'Check back later for new products!')}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={handleAddToCart}
          loading={!!addingToCart[product.id]}
        />
      ))}
    </div>
  );
};


// Example usage: Place <LanguageSwitcher /> at the top of your main layout or _app.js

export default ProductList;

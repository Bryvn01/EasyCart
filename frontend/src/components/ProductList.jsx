import React, { useState } from 'react';
import ProductListErrorUI from './ProductListErrorUI';
import ProductFilterBar from './ProductFilterBar';
import { productsAPI, getApiBaseUrl } from '../services/api';
import { handleApiError, retryWithBackoff, checkApiHealth } from '../utils/errorHandler';
import { ProductGridSkeleton } from './ui/LoadingSkeleton';
import EmptyState from './EmptyState';
import ProductCard from './ProductCard';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';

/**
 * ProductList Component
 * Fetches and displays products from the backend API with enhanced error handling
 */

const fetchProducts = async (filters) => {
  const apiBaseUrl = getApiBaseUrl();
  const isHealthy = await checkApiHealth(apiBaseUrl);
  if (!isHealthy && process.env.NODE_ENV === 'development') {
    console.warn('API health check failed, but continuing with request...');
  }
  const response = await retryWithBackoff(
    async () => productsAPI.getProducts(filters),
    2,
    1500
  );
  const productsData = response.data.results || response.data;
  return Array.isArray(productsData) ? productsData : [];
};

/**
 * ProductList
 * @param {Object} props
 * @param {string} [props.search] - Search query
 * @param {number} [props.category] - Category ID
 * @param {string} [props.brand] - Brand name
 * @param {[number, number]} [props.price] - Price range [min, max]
 * @param {string} [props.sort] - Sort order
 */
const ProductList = (props) => {
  const { t } = useTranslation();
  // Filter/search state is managed here and passed to ProductFilterBar and product query
  const [filters, setFilters] = useState({
    search: props.search || '',
    category: props.category || null,
    brand: props.brand || '',
    price: props.price || [0, 0],
    sort: props.sort || '',
  });
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

  // Prepare API params
  const apiFilters = {};
  if (filters.search) apiFilters.search = filters.search;
  if (filters.category) apiFilters.category = filters.category;
  if (filters.brand) apiFilters.brand = filters.brand;
  if (filters.price && filters.price.length === 2) {
    apiFilters.price_min = filters.price[0];
    apiFilters.price_max = filters.price[1];
  }
  if (filters.sort) apiFilters.sort = filters.sort;

  const {
    data: products,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['products', apiFilters],
    queryFn: () => fetchProducts(apiFilters),
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

  // --- UI ---
  return (
    <>
      <ProductFilterBar
        onChange={setFilters}
        initial={filters}
      />
      {isLoading ? (
        <ProductGridSkeleton count={8} />
      ) : isError ? (
        <ProductListErrorUI error={error} onRetry={refetch} t={t} />
      ) : !products || products.length === 0 ? (
        <EmptyState
          type="products"
          title={t('noProductsAvailable', 'No products available')}
          message={t('checkBackLater', 'Check back later for new products!')}
          actionText={t('browseAllProducts', 'Browse All Products')}
          actionLink="/products"
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
          {products
            .filter(product => product && product.id && product.name)
            .map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                loading={!!addingToCart[product.id]}
              />
            ))}
        </div>
      )}
    </>
  );
};


// Example usage: Place <LanguageSwitcher /> at the top of your main layout or _app.js

export default ProductList;

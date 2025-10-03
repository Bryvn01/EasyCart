import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { productsAPI, ordersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import SearchInput from '../components/ui/SearchInput';
import { ProductGridSkeleton } from '../components/ui';
import { handleApiError, handleApiSuccess } from '../utils/errorHandler';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [minRating, setMinRating] = useState('');
  const [inStock, setInStock] = useState('');
  const [loading, setLoading] = useState(true);
  
  const { isAuthenticated } = useAuth();
  const { fetchCartCount } = useCart();
  const location = useLocation();

  useEffect(() => {
    // Get search term from URL parameters
    const urlParams = new URLSearchParams(location.search);
    const urlSearch = urlParams.get('search');
    if (urlSearch && urlSearch !== searchTerm) {
      setSearchTerm(urlSearch);
    }
  }, [location.search, searchTerm]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const params = {};
        if (selectedCategory) params.category = selectedCategory;
        if (selectedBrand) params.brand = selectedBrand;
        if (debouncedSearchTerm) params.search = debouncedSearchTerm;
        if (sortBy) params.sort = sortBy; // Changed from ordering to sort
        if (priceRange.min) params.min_price = priceRange.min; // Changed from price_min
        if (priceRange.max) params.max_price = priceRange.max; // Changed from price_max
        if (minRating) params.rating = minRating;
        if (inStock) params.inStock = inStock;
        
        const response = await productsAPI.getProducts(params);
        let productsData = response.data.data || response.data.results || response.data;
        if (Array.isArray(productsData)) {
          productsData = productsData.map(p => ({ ...p, id: p._id || p.id, category: p.category || p.category_name }));
        }
        setProducts(Array.isArray(productsData) ? productsData : []);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [selectedCategory, selectedBrand, debouncedSearchTerm, sortBy, priceRange.min, priceRange.max, minRating, inStock]);

  useEffect(() => {
    fetchCategories();
    fetchBrands();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await productsAPI.getCategories();
      // Handle paginated response from Django REST framework
      const categoriesData = response.data.results || response.data;
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const fetchBrands = async () => {
    try {
      // Fetch all products and extract unique brands
      const response = await productsAPI.getProducts({ limit: 1000 });
      const productsData = response.data.data || response.data.results || response.data;
      if (Array.isArray(productsData)) {
        const uniqueBrands = [...new Set(productsData.map(p => p.brand).filter(Boolean))].sort();
        setBrands(uniqueBrands);
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
      setBrands([]);
    }
  };

  const addToCart = async (productId) => {
    if (!isAuthenticated) {
      handleApiError({ message: 'Please login to add items to cart' });
      return;
    }

    try {
      await ordersAPI.addToCart({ product_id: productId, quantity: 1 });
      fetchCartCount();
      handleApiSuccess('Product added to cart! 🛒');
    } catch (error) {
      console.error('Error adding to cart:', error);
      handleApiError(error, 'Failed to add product to cart');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96 animate-pulse"></div>
        </div>
        <ProductGridSkeleton count={8} />
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {selectedCategory ? 
            `${categories.find(cat => cat.id === selectedCategory)?.name || 'Category'} Products` : 
            'Our Products'
          }
        </h1>
        <p style={{ color: 'var(--gray-600)' }}>
          {debouncedSearchTerm ? 
            `Search results for "${debouncedSearchTerm}"` :
            'Discover quality Kenyan products at great prices'
          }
        </p>
      </div>
      
      {/* Active Filters Summary */}
      {(selectedCategory || selectedBrand || debouncedSearchTerm || sortBy || priceRange.min || priceRange.max || minRating || inStock) && (
        <div style={{ 
          background: 'var(--primary-50)', 
          padding: 'var(--space-3)', 
          borderRadius: 'var(--radius-md)', 
          marginBottom: 'var(--space-4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--primary-700)' }}>
            <strong>Active Filters:</strong>
            {selectedCategory && <span> Category: {categories.find(cat => cat.id === selectedCategory)?.name}</span>}
            {selectedBrand && <span> Brand: {selectedBrand}</span>}
            {debouncedSearchTerm && <span> Search: "{debouncedSearchTerm}"</span>}
            {sortBy && <span> Sort: {sortBy.replace('-', '').replace('_', ' ')}</span>}
            {(priceRange.min || priceRange.max) && <span> Price: KES {priceRange.min || '0'} - {priceRange.max || '∞'}</span>}
            {minRating && <span> Rating: {minRating}+ ⭐</span>}
            {inStock && <span> Stock: {inStock === 'true' ? 'In Stock Only' : 'All'}</span>}
          </div>
          <button
            onClick={() => {
              setSelectedCategory('');
              setSelectedBrand('');
              setSearchTerm('');
              setDebouncedSearchTerm('');
              setSortBy('');
              setPriceRange({ min: '', max: '' });
              setMinRating('');
              setInStock('');
            }}
            style={{
              background: 'var(--primary-600)',
              color: 'white',
              border: 'none',
              padding: 'var(--space-1) var(--space-3)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            Clear All
          </button>
        </div>
      )}
      
      {/* Filters */}
      <div className="card" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
          {/* Search */}
          <div>
            <SearchInput
              onSearch={setSearchTerm}
              placeholder="Search products..."
            />
          </div>
          
          {/* Category Filter */}
          <div>
            <select
              className="form-control"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {Array.isArray(categories) && categories.map(category => (
                <option key={category.id || category._id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Brand Filter */}
          <div>
            <select
              className="form-control"
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
            >
              <option value="">All Brands</option>
              {Array.isArray(brands) && brands.map(brand => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>
          
          {/* Sort By */}
          <div>
            <select
              className="form-control"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="">Sort By</option>
              <option value="-createdAt">Newest First</option>
              <option value="createdAt">Oldest First</option>
              <option value="name">Name: A-Z</option>
              <option value="-name">Name: Z-A</option>
              <option value="price">Price: Low to High</option>
              <option value="-price">Price: High to Low</option>
              <option value="-rating">Highest Rated</option>
            </select>
          </div>
          
          {/* Min Price */}
          <div>
            <input
              type="number"
              className="form-control"
              placeholder="Min Price (KES)"
              min="0"
              value={priceRange.min}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || (!isNaN(value) && parseFloat(value) >= 0)) {
                  setPriceRange(prev => ({ ...prev, min: value }));
                }
              }}
            />
          </div>
          
          {/* Max Price */}
          <div>
            <input
              type="number"
              className="form-control"
              placeholder="Max Price (KES)"
              min="0"
              value={priceRange.max}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || (!isNaN(value) && parseFloat(value) >= 0)) {
                  setPriceRange(prev => ({ ...prev, max: value }));
                }
              }}
            />
          </div>
          
          {/* Rating Filter */}
          <div>
            <select
              className="form-control"
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
            >
              <option value="">All Ratings</option>
              <option value="4">4+ ⭐ & Above</option>
              <option value="3">3+ ⭐ & Above</option>
              <option value="2">2+ ⭐ & Above</option>
              <option value="1">1+ ⭐ & Above</option>
            </select>
          </div>
          
          {/* Stock Availability */}
          <div>
            <select
              className="form-control"
              value={inStock}
              onChange={(e) => setInStock(e.target.value)}
            >
              <option value="">All Products</option>
              <option value="true">In Stock Only</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Products Grid */}
      <div className="grid grid-cols-4 gap-6">
        {products.map(product => (
          <div key={product.id} className="card">
            {/* Product Image */}
            <div style={{
              height: '200px',
              background: 'var(--gray-100)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              {product.image ? (
                <img
                  src={product.image.startsWith('http') ? product.image : `http://localhost:8000${product.image}`}
                  alt={product.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div style={{
                display: product.image ? 'none' : 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--gray-500)',
                fontSize: '2rem'
              }}>
                📦
              </div>
              
              {/* Stock Badge */}
              {product.stock === 0 && (
                <div style={{
                  position: 'absolute',
                  top: 'var(--space-2)',
                  right: 'var(--space-2)',
                  background: 'var(--error)',
                  color: 'white',
                  padding: 'var(--space-1) var(--space-2)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  fontWeight: '500'
                }}>
                  Out of Stock
                </div>
              )}
            </div>
            
            {/* Product Info */}
            <div className="p-4">
              <div style={{
                fontSize: '0.75rem',
                color: 'var(--primary-600)',
                fontWeight: '500',
                marginBottom: 'var(--space-1)'
              }}>
                {product.category}
              </div>
              
              <h3 style={{
                fontSize: '1rem',
                fontWeight: '600',
                marginBottom: 'var(--space-2)',
                lineHeight: '1.4'
              }}>
                {product.name}
              </h3>
              
              {/* Rating Display */}
              {product.rating && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-1)',
                  marginBottom: 'var(--space-2)',
                  fontSize: '0.875rem'
                }}>
                  <span style={{ color: '#FFA500' }}>
                    {'⭐'.repeat(Math.round(product.rating))}
                  </span>
                  <span style={{ color: 'var(--gray-600)' }}>
                    ({product.rating.toFixed(1)})
                  </span>
                  {product.reviewCount > 0 && (
                    <span style={{ color: 'var(--gray-500)', fontSize: '0.75rem' }}>
                      {product.reviewCount} reviews
                    </span>
                  )}
                </div>
              )}
              
              <p style={{
                color: 'var(--gray-600)',
                fontSize: '0.875rem',
                marginBottom: 'var(--space-4)',
                lineHeight: '1.4'
              }}>
                {product.description.substring(0, 80)}...
              </p>
              
              <div className="flex justify-between items-center">
                <span style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  color: 'var(--gray-900)'
                }}>
                  KES {product.price}
                </span>
                
                <div className="flex gap-2">
                  <Link
                    to={`/products/${product.id}`}
                    className="btn btn-secondary"
                    style={{ padding: 'var(--space-2) var(--space-3)', fontSize: '0.75rem' }}
                  >
                    View
                  </Link>
                  <button
                    onClick={() => addToCart(product.id)}
                    className="btn btn-primary"
                    disabled={product.stock === 0}
                    style={{
                      padding: 'var(--space-2) var(--space-3)',
                      fontSize: '0.75rem',
                      opacity: product.stock === 0 ? 0.5 : 1
                    }}
                  >
                    {product.stock === 0 ? 'Sold Out' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {products.length === 0 && !loading && (
        <div className="text-center py-16">
          <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}>🔍</div>
          <h3 className="text-xl font-semibold mb-2">
            {debouncedSearchTerm ? `No products found for "${debouncedSearchTerm}"` : 'No products found'}
          </h3>
          <p style={{ color: 'var(--gray-600)' }}>
            {debouncedSearchTerm 
              ? 'Try searching with different keywords or check your spelling'
              : 'Try adjusting your search or filter criteria'
            }
          </p>
          {debouncedSearchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                setDebouncedSearchTerm('');
              }}
              className="btn btn-secondary"
              style={{ marginTop: 'var(--space-4)' }}
            >
              Clear Search
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Products;
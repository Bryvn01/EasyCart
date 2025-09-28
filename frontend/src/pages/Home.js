
import { useState, useEffect } from 'react';
import axios from 'axios';
import ProductGrid from '../components/ProductGrid';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/products');
        setProducts(response.data);
        setError('');
      } catch (err) {
        setError('Failed to load products. Please try again later.');
        console.error('API Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = (product) => {
    // TODO: Implement add to cart logic
    alert(`Added ${product.name} to cart!`);
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="text-center text-red-500 p-4">
      <p>{error}</p>
      <button 
        onClick={() => window.location.reload()} 
        className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
      >
        Retry
      </button>
    </div>
  );

  if (products.length === 0) return (
    <div className="text-center p-8">
      <h2 className="text-xl text-gray-600">No products available</h2>
      <p className="text-gray-500">Check back later for new items</p>
    </div>
  );

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Featured Products</h1>
      <ProductGrid products={products} onAddToCart={handleAddToCart} loading={loading} />
    </div>
  );
};

export default Home;
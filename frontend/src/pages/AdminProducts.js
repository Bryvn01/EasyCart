import React, { useState, useEffect } from 'react';
import { productsAPI } from '../services/api';
import ProductEditModal from '../components/ProductEditModal';
import { useAuth } from '../context/AuthContext';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.is_admin) {
      alert('Access denied. Admin privileges required.');
      return;
    }
    fetchProducts();
  }, [user]);

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getProducts();
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleUpdateProduct = (updatedProduct) => {
    setProducts(prev => 
      prev.map(product => 
        product.id === updatedProduct.id ? updatedProduct : product
      )
    );
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await productsAPI.deleteProduct(productId);
      setProducts(prev => prev.filter(product => product.id !== productId));
      alert('Product deleted successfully! 🗑️');
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  if (!user?.is_admin) {
    return (
      <div className="container py-16 text-center">
        <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}>🚫</div>
        <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
        <p style={{ color: 'var(--gray-600)' }}>
          You need admin privileges to access this page.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container py-16 text-center">
        <div style={{ fontSize: '2rem' }}>⏳</div>
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Product Management</h1>
          <p style={{ color: 'var(--gray-600)' }}>
            Manage your product catalog
          </p>
        </div>
        <a
          href="http://localhost:8000/admin/products/product/add/"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
          style={{ padding: 'var(--space-3) var(--space-6)' }}
        >
          + Add New Product
        </a>
      </div>

      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--gray-200)' }}>
                <th style={{ padding: 'var(--space-4)', textAlign: 'left', fontWeight: '600' }}>Product</th>
                <th style={{ padding: 'var(--space-4)', textAlign: 'left', fontWeight: '600' }}>Category</th>
                <th style={{ padding: 'var(--space-4)', textAlign: 'left', fontWeight: '600' }}>Price</th>
                <th style={{ padding: 'var(--space-4)', textAlign: 'left', fontWeight: '600' }}>Stock</th>
                <th style={{ padding: 'var(--space-4)', textAlign: 'left', fontWeight: '600' }}>Status</th>
                <th style={{ padding: 'var(--space-4)', textAlign: 'left', fontWeight: '600' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                  <td style={{ padding: 'var(--space-4)' }}>
                    <div className="flex items-center gap-3">
                      <div style={{
                        width: '50px',
                        height: '50px',
                        background: 'var(--gray-100)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {product.image ? (
                          <img
                            src={`http://localhost:8000${product.image}`}
                            alt={product.name}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              borderRadius: 'var(--radius-md)'
                            }}
                          />
                        ) : (
                          <span style={{ fontSize: '1.5rem' }}>📦</span>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold">{product.name}</div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                          ID: {product.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: 'var(--space-4)' }}>
                    {product.category_name || 'No Category'}
                  </td>
                  <td style={{ padding: 'var(--space-4)' }}>
                    <span className="font-semibold">KES {product.price}</span>
                  </td>
                  <td style={{ padding: 'var(--space-4)' }}>
                    <span style={{
                      background: product.stock > 0 ? 'var(--success)' : 'var(--error)',
                      color: 'white',
                      padding: 'var(--space-1) var(--space-2)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      fontWeight: '500'
                    }}>
                      {product.stock} units
                    </span>
                  </td>
                  <td style={{ padding: 'var(--space-4)' }}>
                    <span style={{
                      background: product.is_active ? 'var(--success)' : 'var(--gray-400)',
                      color: 'white',
                      padding: 'var(--space-1) var(--space-2)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      fontWeight: '500'
                    }}>
                      {product.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: 'var(--space-4)' }}>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="btn btn-secondary"
                        style={{
                          padding: 'var(--space-1) var(--space-2)',
                          fontSize: '0.75rem'
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        style={{
                          background: 'var(--error)',
                          color: 'white',
                          border: 'none',
                          padding: 'var(--space-1) var(--space-2)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          cursor: 'pointer'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {products.length === 0 && (
        <div className="text-center py-16">
          <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}>📦</div>
          <h3 className="text-xl font-semibold mb-2">No products found</h3>
          <p style={{ color: 'var(--gray-600)', marginBottom: 'var(--space-4)' }}>
            Start by adding your first product
          </p>
          <a
            href="http://localhost:8000/admin/products/product/add/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            Add Product
          </a>
        </div>
      )}

      <ProductEditModal
        product={editingProduct}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        onUpdate={handleUpdateProduct}
      />
    </div>
  );
};

export default AdminProducts;
import React, { useState } from 'react';

const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '', price: '', category: 'Groceries', description: '', 
    stock: '', image: '', brand: '', weight: ''
  });

  const categories = ['Electronics', 'Fashion', 'Home & Living', 'Food & Beverages', 'Health & Beauty', 'Sports & Fitness', 'Groceries'];

  const handleSubmit = (e) => {
    e.preventDefault();
    const newProduct = {
      id: Date.now(),
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      rating: 4.5
    };
    setProducts([...products, newProduct]);
    setFormData({
      name: '', price: '', category: 'Groceries', description: '', 
      stock: '', image: '', brand: '', weight: ''
    });
    setShowAddForm(false);
    alert('Product added! Note: Changes are temporary in demo mode.');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2>Admin - Product Manager</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Demo Mode: Add products temporarily. For permanent changes, implement backend API.
      </p>
      
      <button 
        onClick={() => setShowAddForm(true)}
        style={{ 
          backgroundColor: '#007bff', color: 'white', padding: '12px 24px', 
          border: 'none', borderRadius: '6px', marginBottom: '20px', cursor: 'pointer'
        }}
      >
        + Add New Product
      </button>

      {showAddForm && (
        <div style={{ 
          backgroundColor: '#f8f9fa', padding: '24px', borderRadius: '8px', 
          marginBottom: '20px', border: '1px solid #dee2e6'
        }}>
          <h3>Add New Product</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <input
                type="text" placeholder="Product Name (e.g., Fresh Mangoes - 1kg)"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ced4da' }}
              />
              <input
                type="number" placeholder="Price in KSh (e.g., 150)"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                required
                style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ced4da' }}
              />
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ced4da' }}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <input
                type="number" placeholder="Stock Quantity (e.g., 50)"
                value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: e.target.value})}
                required
                style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ced4da' }}
              />
              <input
                type="text" placeholder="Brand (e.g., Local Farm)"
                value={formData.brand}
                onChange={(e) => setFormData({...formData, brand: e.target.value})}
                style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ced4da' }}
              />
              <input
                type="text" placeholder="Weight/Size (e.g., 1kg, 500ml)"
                value={formData.weight}
                onChange={(e) => setFormData({...formData, weight: e.target.value})}
                style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ced4da' }}
              />
            </div>
            <textarea
              placeholder="Product Description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required
              style={{ 
                width: '100%', padding: '10px', borderRadius: '4px', 
                border: '1px solid #ced4da', marginBottom: '16px', minHeight: '80px'
              }}
            />
            <input
              type="url" placeholder="Image URL (use Unsplash: https://images.unsplash.com/photo-...)"
              value={formData.image}
              onChange={(e) => setFormData({...formData, image: e.target.value})}
              required
              style={{ 
                width: '100%', padding: '10px', borderRadius: '4px', 
                border: '1px solid #ced4da', marginBottom: '16px'
              }}
            />
            <div>
              <button 
                type="submit"
                style={{ 
                  backgroundColor: '#28a745', color: 'white', padding: '12px 24px', 
                  border: 'none', borderRadius: '4px', marginRight: '10px', cursor: 'pointer'
                }}
              >
                Add Product
              </button>
              <button 
                type="button"
                onClick={() => setShowAddForm(false)}
                style={{ 
                  backgroundColor: '#6c757d', color: 'white', padding: '12px 24px', 
                  border: 'none', borderRadius: '4px', cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ 
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
        gap: '20px' 
      }}>
        {products.map(product => (
          <div key={product.id} style={{ 
            border: '1px solid #dee2e6', borderRadius: '8px', padding: '16px',
            backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <img 
              src={product.image} alt={product.name}
              style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '6px' }}
            />
            <h4 style={{ margin: '12px 0 6px 0', fontSize: '16px' }}>{product.name}</h4>
            <p style={{ color: '#6c757d', fontSize: '14px', margin: '4px 0' }}>{product.category}</p>
            <p style={{ fontWeight: 'bold', color: '#007bff', margin: '6px 0', fontSize: '18px' }}>
              KSh {product.price}
            </p>
            <p style={{ fontSize: '12px', color: '#6c757d', margin: '4px 0' }}>
              Stock: {product.stock} | {product.weight}
            </p>
            <p style={{ fontSize: '12px', color: '#6c757d' }}>Brand: {product.brand}</p>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div style={{ 
          textAlign: 'center', padding: '40px', color: '#6c757d',
          border: '2px dashed #dee2e6', borderRadius: '8px', marginTop: '20px'
        }}>
          <h3>No products added yet</h3>
          <p>Click "Add New Product" to start adding items to your store</p>
        </div>
      )}
    </div>
  );
};

export default ProductManager;
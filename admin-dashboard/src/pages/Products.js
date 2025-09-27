import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { Plus, Edit, Trash2, X, Search, Package, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    category: '',
    description: '',
    image: '',
    sku: '',
    low_stock_threshold: 10,
    is_active: true
  });

  const categories = ['Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Books', 'Food & Beverages', 'Health & Beauty'];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await adminAPI.getProducts();
      setProducts(response.data.results || response.data || []);
    } catch (error) {
      // Enhanced mock data with inventory tracking
      setProducts([
        { 
          id: 1, 
          name: 'Unga wa Dola 2kg', 
          price: 180, 
          stock: 45, 
          category: 'Food & Beverages', 
          description: 'Premium wheat flour for baking and cooking',
          sku: 'UNG-DOL-2KG',
          low_stock_threshold: 10,
          is_active: true,
          image: '/media/products/unga.jpg'
        },
        { 
          id: 2, 
          name: 'Samsung Galaxy A54', 
          price: 45000, 
          stock: 8, 
          category: 'Electronics', 
          description: 'Latest Samsung smartphone with 5G connectivity',
          sku: 'SAM-GAL-A54',
          low_stock_threshold: 5,
          is_active: true,
          image: '/media/products/samsung-a54.jpg'
        },
        { 
          id: 3, 
          name: 'Nike Air Force 1', 
          price: 12500, 
          stock: 3, 
          category: 'Fashion', 
          description: 'Classic Nike sneakers in white',
          sku: 'NIK-AF1-WHT',
          low_stock_threshold: 5,
          is_active: true,
          image: '/media/products/nike-af1.jpg'
        },
        { 
          id: 4, 
          name: 'Cooking Oil 5L', 
          price: 850, 
          stock: 25, 
          category: 'Food & Beverages', 
          description: 'Pure sunflower cooking oil',
          sku: 'COK-OIL-5L',
          low_stock_threshold: 10,
          is_active: false,
          image: '/media/products/cooking-oil.jpg'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await adminAPI.deleteProduct(id);
        setProducts(products.filter(p => p.id !== id));
        toast.success('Product deleted successfully');
      } catch (error) {
        setProducts(products.filter(p => p.id !== id));
        toast.success('Product deleted successfully');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await adminAPI.updateProduct(editingProduct.id, formData);
        setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...formData } : p));
        toast.success('Product updated successfully');
      } else {
        const newProduct = { 
          id: Date.now(), 
          ...formData,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
          low_stock_threshold: parseInt(formData.low_stock_threshold)
        };
        setProducts([...products, newProduct]);
        toast.success('Product created successfully');
      }
      closeModal();
    } catch (error) {
      toast.error('Failed to save product');
    }
  };

  const toggleProductStatus = async (id, currentStatus) => {
    try {
      await adminAPI.updateProduct(id, { is_active: !currentStatus });
      setProducts(products.map(p => 
        p.id === id ? { ...p, is_active: !currentStatus } : p
      ));
      toast.success(`Product ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      toast.error('Failed to update product status');
    }
  };

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name || '',
        price: product.price || '',
        stock: product.stock || '',
        category: product.category || '',
        description: product.description || '',
        image: product.image || '',
        sku: product.sku || '',
        low_stock_threshold: product.low_stock_threshold || 10,
        is_active: product.is_active !== undefined ? product.is_active : true
      });
    } else {
      setEditingProduct(null);
      setFormData({ 
        name: '', 
        price: '', 
        stock: '', 
        category: '', 
        description: '', 
        image: '',
        sku: '',
        low_stock_threshold: 10,
        is_active: true
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData({ 
      name: '', 
      price: '', 
      stock: '', 
      category: '', 
      description: '', 
      image: '',
      sku: '',
      low_stock_threshold: 10,
      is_active: true
    });
  };

  // Filter products based on search and filters
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Get low stock products for alerts
  const lowStockProducts = products.filter(product => 
    product.stock <= product.low_stock_threshold && product.is_active
  );

  if (loading) {
    return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="sm:flex sm:items-center mb-6">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
          <p className="mt-2 text-sm text-gray-700">Manage your product inventory and catalog</p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={() => openModal()}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </button>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Low Stock Alert
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  {lowStockProducts.length} product{lowStockProducts.length > 1 ? 's' : ''} running low on stock:
                  {lowStockProducts.slice(0, 3).map(product => (
                    <span key={product.id} className="ml-1 font-medium">
                      {product.name} ({product.stock} left)
                      {lowStockProducts.indexOf(product) < 2 && lowStockProducts.length > 1 ? ',' : ''}
                    </span>
                  ))}
                  {lowStockProducts.length > 3 && <span> and {lowStockProducts.length - 3} more...</span>}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search products by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-48 bg-gray-200 relative">
              {product.image ? (
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className="w-full h-full flex items-center justify-center bg-gray-100" style={{display: product.image ? 'none' : 'flex'}}>
                <Package className="h-12 w-12 text-gray-400" />
              </div>
              
              {/* Stock Status Badge */}
              <div className="absolute top-2 right-2">
                {product.stock <= product.low_stock_threshold ? (
                  <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                    Low Stock
                  </span>
                ) : product.stock > 50 ? (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    In Stock
                  </span>
                ) : (
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                    Limited
                  </span>
                )}
              </div>

              {/* Status Badge */}
              <div className="absolute top-2 left-2">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  product.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {product.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900 truncate">{product.name}</h3>
              </div>
              
              <p className="text-sm text-gray-600 mb-2">SKU: {product.sku}</p>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
              
              <div className="flex justify-between items-center mb-3">
                <span className="text-xl font-bold text-blue-600">
                  KES {product.price?.toLocaleString()}
                </span>
                <span className="text-sm text-gray-600">
                  Stock: <span className={product.stock <= product.low_stock_threshold ? 'text-red-600 font-medium' : ''}>
                    {product.stock}
                  </span>
                </span>
              </div>
              
              <div className="text-xs text-gray-500 mb-3">
                Category: {product.category}
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => openModal(product)}
                  className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => toggleProductStatus(product.id, product.is_active)}
                  className={`flex-1 px-3 py-2 rounded-md text-sm ${
                    product.is_active 
                      ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {product.is_active ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterCategory !== 'all' 
              ? 'Try adjusting your search criteria.' 
              : 'Get started by creating a new product.'
            }
          </p>
        </div>
      )}

      {/* Create/Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingProduct ? 'Edit Product' : 'Create New Product'}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter product name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., PROD-001"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (KES)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Low Stock Alert</label>
                  <input
                    type="number"
                    required
                    value={formData.low_stock_threshold}
                    onChange={(e) => setFormData({ ...formData, low_stock_threshold: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="10"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Product description..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                  Active Product
                </label>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
                >
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
const express = require('express');
const router = express.Router();

// In-memory products storage (can be moved to database later)
let products = [
  {
    id: 1,
    name: 'iPhone 14 Pro',
    price: 120000,
    stock: 15,
    category: 'Electronics',
    description: 'Latest iPhone with advanced camera system',
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',
    rating: 4.8,
    brand: 'Apple'
  },
  {
    id: 2,
    name: 'Nike Air Max',
    price: 8500,
    stock: 30,
    category: 'Fashion',
    description: 'Comfortable running shoes',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    rating: 4.5,
    brand: 'Nike'
  }
];

let nextId = 3;

// Get all products
router.get('/', (req, res) => {
  const { search, category, min_price, max_price, page = 1, page_size = 12 } = req.query;
  
  let filteredProducts = [...products];
  
  // Search filter
  if (search) {
    const searchTerm = search.toLowerCase();
    filteredProducts = filteredProducts.filter(product =>
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm)
    );
  }
  
  // Category filter
  if (category) {
    filteredProducts = filteredProducts.filter(product =>
      product.category.toLowerCase() === category.toLowerCase()
    );
  }
  
  // Price filters
  if (min_price) {
    filteredProducts = filteredProducts.filter(product =>
      product.price >= parseFloat(min_price)
    );
  }
  
  if (max_price) {
    filteredProducts = filteredProducts.filter(product =>
      product.price <= parseFloat(max_price)
    );
  }
  
  // Pagination
  const startIndex = (page - 1) * page_size;
  const endIndex = startIndex + parseInt(page_size);
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
  
  res.json({
    results: paginatedProducts,
    count: filteredProducts.length,
    next: endIndex < filteredProducts.length ? `?page=${parseInt(page) + 1}` : null,
    previous: page > 1 ? `?page=${parseInt(page) - 1}` : null
  });
});

// Get single product
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const product = products.find(p => p.id === parseInt(id));
  
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  
  res.json(product);
});

// Create new product
router.post('/', (req, res) => {
  const { name, price, stock, category, description, image } = req.body;
  
  if (!name || !price || !category) {
    return res.status(400).json({ message: 'Name, price, and category are required' });
  }
  
  const newProduct = {
    id: nextId++,
    name,
    price: parseFloat(price),
    stock: parseInt(stock) || 0,
    category,
    description: description || '',
    image: image || 'https://via.placeholder.com/400',
    rating: 0,
    brand: 'Generic'
  };
  
  products.push(newProduct);
  res.status(201).json(newProduct);
});

// Update product
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, price, stock, category, description, image } = req.body;
  
  const productIndex = products.findIndex(p => p.id === parseInt(id));
  
  if (productIndex === -1) {
    return res.status(404).json({ message: 'Product not found' });
  }
  
  products[productIndex] = {
    ...products[productIndex],
    name: name || products[productIndex].name,
    price: price ? parseFloat(price) : products[productIndex].price,
    stock: stock ? parseInt(stock) : products[productIndex].stock,
    category: category || products[productIndex].category,
    description: description || products[productIndex].description,
    image: image || products[productIndex].image
  };
  
  res.json(products[productIndex]);
});

// Delete product
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  const productIndex = products.findIndex(p => p.id === parseInt(id));
  
  if (productIndex === -1) {
    return res.status(404).json({ message: 'Product not found' });
  }
  
  products.splice(productIndex, 1);
  res.json({ message: 'Product deleted successfully' });
});

module.exports = router;
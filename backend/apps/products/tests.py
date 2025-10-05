"""
Unit tests for MongoDB utility functions.
These tests verify the MongoDB connection and data fetching logic.
"""

import unittest
from unittest.mock import patch, MagicMock
from bson import ObjectId


class TestMongoDBUtils(unittest.TestCase):
    """Test MongoDB utility functions."""
    
    def test_serialize_mongodb_doc(self):
        """Test serialization of MongoDB document."""
        from apps.products.mongodb_utils import serialize_mongodb_doc
        
        # Test document with ObjectId
        doc = {
            '_id': ObjectId('507f1f77bcf86cd799439011'),
            'name': 'Test Product',
            'price': 100,
            'category': 'Electronics'
        }
        
        result = serialize_mongodb_doc(doc)
        
        # Check that _id is converted to id
        self.assertEqual(result['id'], '507f1f77bcf86cd799439011')
        self.assertNotIn('_id', result)
        
        # Check other fields are preserved
        self.assertEqual(result['name'], 'Test Product')
        self.assertEqual(result['price'], 100)
        self.assertEqual(result['category'], 'Electronics')
    
    def test_serialize_mongodb_doc_with_nested_objects(self):
        """Test serialization of nested MongoDB documents."""
        from apps.products.mongodb_utils import serialize_mongodb_doc
        
        doc = {
            '_id': ObjectId('507f1f77bcf86cd799439011'),
            'name': 'Test',
            'images': [
                {'url': 'http://example.com/img1.jpg', 'alt': 'Image 1'},
                {'url': 'http://example.com/img2.jpg', 'alt': 'Image 2'}
            ]
        }
        
        result = serialize_mongodb_doc(doc)
        
        # Check nested lists are handled
        self.assertEqual(len(result['images']), 2)
        self.assertEqual(result['images'][0]['url'], 'http://example.com/img1.jpg')
    
    def test_serialize_mongodb_doc_none(self):
        """Test serialization of None document."""
        from apps.products.mongodb_utils import serialize_mongodb_doc
        
        result = serialize_mongodb_doc(None)
        self.assertIsNone(result)
    
    @patch('apps.products.mongodb_utils.MongoDBConnection')
    def test_get_products_from_mongodb(self, mock_connection):
        """Test fetching products from MongoDB."""
        from apps.products.mongodb_utils import get_products_from_mongodb
        
        # Mock MongoDB collection
        mock_collection = MagicMock()
        mock_connection.return_value.get_collection.return_value = mock_collection
        
        # Mock cursor
        mock_cursor = MagicMock()
        mock_cursor.sort.return_value = mock_cursor
        mock_cursor.skip.return_value = mock_cursor
        mock_cursor.limit.return_value = mock_cursor
        
        # Mock products
        mock_products = [
            {
                '_id': ObjectId('507f1f77bcf86cd799439011'),
                'name': 'Product 1',
                'price': 100,
                'category': 'Electronics'
            }
        ]
        mock_cursor.__iter__ = lambda self: iter(mock_products)
        
        mock_collection.find.return_value = mock_cursor
        mock_collection.count_documents.return_value = 1
        
        # Test function
        products, count = get_products_from_mongodb(limit=10, skip=0)
        
        # Verify results
        self.assertEqual(count, 1)
        self.assertEqual(len(products), 1)
        self.assertEqual(products[0]['name'], 'Product 1')
    
    @patch('apps.products.mongodb_utils.MongoDBConnection')
    def test_get_product_by_id_from_mongodb(self, mock_connection):
        """Test fetching single product by ID."""
        from apps.products.mongodb_utils import get_product_by_id_from_mongodb
        
        # Mock MongoDB collection
        mock_collection = MagicMock()
        mock_connection.return_value.get_collection.return_value = mock_collection
        
        # Mock product
        mock_product = {
            '_id': ObjectId('507f1f77bcf86cd799439011'),
            'name': 'Test Product',
            'price': 100
        }
        mock_collection.find_one.return_value = mock_product
        
        # Test function
        product = get_product_by_id_from_mongodb('507f1f77bcf86cd799439011')
        
        # Verify result
        self.assertIsNotNone(product)
        self.assertEqual(product['name'], 'Test Product')
        self.assertEqual(product['id'], '507f1f77bcf86cd799439011')
    
    @patch('apps.products.mongodb_utils.MongoDBConnection')
    def test_get_categories_from_mongodb(self, mock_connection):
        """Test fetching categories from MongoDB."""
        from apps.products.mongodb_utils import get_categories_from_mongodb
        
        # Mock MongoDB collection
        mock_collection = MagicMock()
        mock_connection.return_value.get_collection.return_value = mock_collection
        
        # Mock cursor
        mock_cursor = MagicMock()
        mock_categories = [
            {'_id': ObjectId('507f1f77bcf86cd799439011'), 'name': 'Electronics'},
            {'_id': ObjectId('507f1f77bcf86cd799439012'), 'name': 'Groceries'}
        ]
        mock_cursor.__iter__ = lambda self: iter(mock_categories)
        
        mock_collection.find.return_value = mock_cursor
        
        # Test function
        categories = get_categories_from_mongodb()
        
        # Verify results
        self.assertEqual(len(categories), 2)
        self.assertEqual(categories[0]['name'], 'Electronics')
        self.assertEqual(categories[1]['name'], 'Groceries')


if __name__ == '__main__':
    unittest.main()

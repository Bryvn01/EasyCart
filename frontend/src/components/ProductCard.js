import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Card } from './ui';
import PropTypes from 'prop-types';

const ProductCard = ({ product, onAddToCart, loading = false }) => {
  const { t } = useTranslation();

  if (!product) {
    return (
      <Card className="p-4">
        <div className="text-center text-gray-500">Product not available</div>
      </Card>
    );
  }

  return (
    <Card 
      hover 
      className="group overflow-hidden transition-all duration-300 hover:shadow-card-hover animate-fade-in"
    >
      <Link to={`/products/${product.id}`} className="block">
        <div className="relative aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
          <img
            src={product.image || '/api/placeholder/300/300'}
            alt={product.name}
            className="h-48 w-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold">
                Out of Stock
              </span>
            </div>
          )}
          {product.stock > 0 && product.stock < 10 && (
            <div className="absolute top-2 right-2">
              <span className="bg-warning-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                Only {product.stock} left
              </span>
            </div>
          )}
        </div>
      </Link>
      
      <div className="p-4 space-y-3">
        <Link to={`/products/${product.id}`}>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors line-clamp-2 min-h-[3.5rem]">
            {product.name}
          </h3>
        </Link>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 min-h-[2.5rem]">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between pt-2">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              KSh {product.price?.toLocaleString()}
            </span>
            {product.stock > 0 && (
              <span className="text-xs text-success-600 dark:text-success-400 font-medium">
                ✓ In stock
              </span>
            )}
          </div>
          
          <Button
            onClick={() => onAddToCart(product)}
            disabled={product.stock === 0 || loading}
            loading={loading}
            size="sm"
            className="shrink-0 transition-all hover:scale-105"
          >
            {product.stock === 0 ? 'Out of Stock' : t('addToCart')}
          </Button>
        </div>
      </div>
    </Card>
  );
};

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    image: PropTypes.string,
    description: PropTypes.string,
    price: PropTypes.number.isRequired,
    stock: PropTypes.number
  }),
  onAddToCart: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

export default ProductCard;

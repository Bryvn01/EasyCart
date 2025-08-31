import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Card } from './ui';

const ProductCard = ({ product, onAddToCart, loading = false }) => {
  const { t } = useTranslation();

  return (
    <Card hover className="overflow-hidden">
      <Link to={`/products/${product.id}`}>
        <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200">
          <img
            src={product.image || '/api/placeholder/300/300'}
            alt={product.name}
            className="h-48 w-full object-cover object-center hover:scale-105 transition-transform duration-300"
          />
        </div>
      </Link>
      
      <div className="p-4">
        <Link to={`/products/${product.id}`}>
          <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>
        
        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
          {product.description}
        </p>
        
        <div className="mt-4 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-primary-600">
              KSh {product.price}
            </span>
            {product.stock > 0 ? (
              <span className="text-sm text-green-600">
                {product.stock} in stock
              </span>
            ) : (
              <span className="text-sm text-red-600">
                Out of stock
              </span>
            )}
          </div>
          
          <Button
            onClick={() => onAddToCart(product)}
            disabled={product.stock === 0 || loading}
            loading={loading}
            size="sm"
            className="shrink-0"
          >
            {t('addToCart')}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;
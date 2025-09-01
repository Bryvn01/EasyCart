import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTranslation } from 'react-i18next';
import Button from './ui/Button';
import CartBadge from './ui/CartBadge';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { cartCount, updateCartCount } = useCart();
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);


  const handleLogout = () => {
    logout(() => updateCartCount(0));
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 text-xl font-bold text-primary-600 hover:text-primary-700 transition-colors"
          >
            <span className="text-2xl">🛒</span>
            <span>Easycart</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className={`hidden md:flex items-center space-x-8`}>
            <Link to="/" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
              {t('home')}
            </Link>
            <Link to="/products" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
              {t('products')}
            </Link>
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-6">
                <Link to="/cart" className="relative text-gray-600 hover:text-primary-600 font-medium transition-colors">
                  {t('cart')}
                  <CartBadge count={cartCount} />
                </Link>
                <Link to="/orders" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
                  {t('orders')}
                </Link>
                <Link to="/profile" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
                  {t('profile')}
                </Link>
                {user?.is_admin && (
                  <Link to="/admin/dashboard" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
                    {t('admin')}
                  </Link>
                )}
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    Hi, {user?.username}
                  </span>
                  <Button variant="secondary" size="sm" onClick={handleLogout}>
                    {t('logout')}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex space-x-3">
                <Button variant="ghost" size="sm" as={Link} to="/login">
                  {t('login')}
                </Button>
                <Button variant="primary" size="sm" as={Link} to="/register">
                  {t('register')}
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 pt-4 pb-4">
            <div className="flex flex-col space-y-4">
              <Link to="/" className="text-gray-600 hover:text-primary-600 font-medium">
                {t('home')}
              </Link>
              <Link to="/products" className="text-gray-600 hover:text-primary-600 font-medium">
                {t('products')}
              </Link>
              {isAuthenticated ? (
                <>
                  <Link to="/cart" className="relative text-gray-600 hover:text-primary-600 font-medium">
                    {t('cart')}
                    <CartBadge count={cartCount} />
                  </Link>
                  <Link to="/orders" className="text-gray-600 hover:text-primary-600 font-medium">
                    {t('orders')}
                  </Link>
                  <Link to="/profile" className="text-gray-600 hover:text-primary-600 font-medium">
                    {t('profile')}
                  </Link>
                  {user?.is_admin && (
                    <Link to="/admin/dashboard" className="text-gray-600 hover:text-primary-600 font-medium">
                      {t('admin')}
                    </Link>
                  )}
                  <Button variant="secondary" onClick={handleLogout} className="w-full">
                    {t('logout')}
                  </Button>
                </>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Button variant="ghost" as={Link} to="/login" className="w-full">
                    {t('login')}
                  </Button>
                  <Button variant="primary" as={Link} to="/register" className="w-full">
                    {t('register')}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
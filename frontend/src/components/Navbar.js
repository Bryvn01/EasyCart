import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTranslation } from 'react-i18next';
import Button from './ui/Button';
import CartBadge from './ui/CartBadge';
import { useTheme } from '../context/ThemeContext';
import { FiMenu, FiX, FiShoppingCart, FiSun, FiMoon } from 'react-icons/fi';

const NAVBAR_HEIGHT_DEFAULT = 'h-16';
const NAVBAR_HEIGHT_SCROLLED = 'h-14';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { cartCount, updateCartCount } = useCart();
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const mobileMenuRef = useRef(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMenuOpen]);

  const handleLogout = () => {
    logout(() => updateCartCount(0));
    setIsMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsMenuOpen(false);
    }
  };

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav
      className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-[50] transition-all duration-200"
      style={{
        backdropFilter: scrolled ? 'blur(6px)' : 'none',
        backgroundColor: scrolled
          ? (isDarkMode ? 'rgba(31, 41, 55, 0.96)' : 'rgba(255, 255, 255, 0.96)')
          : (isDarkMode ? '#1f2937' : 'white'),
        boxShadow: scrolled ? '0 1px 2px rgba(0, 0, 0, 0.06)' : '0 1px 1px rgba(0, 0, 0, 0.04)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex justify-between items-center gap-4 transition-all duration-200 ${scrolled ? NAVBAR_HEIGHT_SCROLLED : NAVBAR_HEIGHT_DEFAULT}`}>
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-2 text-xl font-bold text-primary-600 hover:text-primary-700 transition-colors flex-shrink-0"
          >
            <FiShoppingCart className="w-7 h-7" />
            <span>EasyCart</span>
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                aria-label="Search"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>

          {/* Desktop Navigation */}
          <div className={`hidden md:flex items-center space-x-6`}>
            <Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors">
              {t('home')}
            </Link>
            <Link to="/products" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors">
              {t('products')}
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center space-x-6">
                <Link to="/cart" className="relative text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-2 group">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="font-medium">{t('cart')}</span>
                  <CartBadge count={cartCount} />
                </Link>
                <Link to="/orders" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors">
                  {t('orders')}
                </Link>
                <Link to="/profile" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors">
                  {t('profile')}
                </Link>
                {user?.is_admin && (
                  <Link to="/admin/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors">
                    {t('admin')}
                  </Link>
                )}
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Hi, {user?.display_name || user?.first_name || user?.preferred_username || user?.username}
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
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg min-w-[44px] min-h-[44px] inline-flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:ring-2 focus:ring-primary-500"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMenuOpen ? (
              <FiX className="h-6 w-6 text-gray-800 dark:text-gray-200" />
            ) : (
              <FiMenu className="h-6 w-6 text-gray-800 dark:text-gray-200" />
            )}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div
            data-testid="mobile-menu-overlay"
            className="fixed inset-0 bg-black/50 z-[60] md:hidden transition-opacity duration-300"
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Mobile Menu */}
        <div
          ref={mobileMenuRef}
          id="mobile-menu"
          data-testid="mobile-menu"
          className={`fixed top-16 left-0 h-[calc(100vh-4rem)] w-80 max-w-[85vw] bg-white dark:bg-gray-800 shadow-2xl z-[70] md:hidden transform transition-transform duration-300 ease-in-out overflow-y-auto ${
            isMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex flex-col p-6 space-y-4">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mb-2">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full px-4 py-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-600"
                  aria-label="Search"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </form>

            {/* Navigation Links */}
            <div className="space-y-1 border-b border-gray-200 dark:border-gray-700 pb-4">
              <Link
                to="/"
                onClick={handleLinkClick}
                className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400 font-medium rounded-lg transition-colors"
              >
                {t('home')}
              </Link>
              <Link
                to="/products"
                onClick={handleLinkClick}
                className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400 font-medium rounded-lg transition-colors"
              >
                {t('products')}
              </Link>
            </div>

            {isAuthenticated ? (
              <>
                <div className="space-y-1 border-b border-gray-200 dark:border-gray-700 pb-4">
                  <Link
                    to="/cart"
                    onClick={handleLinkClick}
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400 font-medium rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>{t('cart')}</span>
                    <CartBadge count={cartCount} />
                  </Link>
                  <Link
                    to="/orders"
                    onClick={handleLinkClick}
                    className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400 font-medium rounded-lg transition-colors"
                  >
                    {t('orders')}
                  </Link>
                  <Link
                    to="/profile"
                    onClick={handleLinkClick}
                    className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400 font-medium rounded-lg transition-colors"
                  >
                    {t('profile')}
                  </Link>
                  {user?.is_admin && (
                    <Link
                      to="/admin/dashboard"
                      onClick={handleLinkClick}
                      className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400 font-medium rounded-lg transition-colors"
                    >
                      {t('admin')}
                    </Link>
                  )}
                </div>

                {/* User Info */}
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Signed in as</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {user?.display_name ||
                     (user?.first_name && user?.last_name
                       ? `${user.first_name} ${user.last_name}`
                       : user?.first_name || user?.preferred_username || user?.username)}
                  </p>
                </div>

                <Button
                  variant="secondary"
                  onClick={handleLogout}
                  className="w-full"
                >
                  {t('logout')}
                </Button>
              </>
            ) : (
              <div className="space-y-3 pt-2">
                <Button
                  variant="ghost"
                  as={Link}
                  to="/login"
                  onClick={handleLinkClick}
                  className="w-full justify-center"
                >
                  {t('login')}
                </Button>
                <Button
                  variant="primary"
                  as={Link}
                  to="/register"
                  onClick={handleLinkClick}
                  className="w-full justify-center"
                >
                  {t('register')}
                </Button>
              </div>
            )}

            {/* Theme Toggle */}
            <button
              onClick={() => {
                toggleTheme();
                setIsMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-4 py-3 mt-4 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <span className="font-medium">
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              </span>
              {isDarkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

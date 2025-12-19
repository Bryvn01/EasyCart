import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiHome, FiSearch, FiShoppingCart, FiUser, FiX } from 'react-icons/fi';
import CartBadge from './ui/CartBadge';
import { useCart } from '../context/CartContext';

/**
 * BottomNav: Mobile bottom navigation bar for EasyCart
 * - Fixed to bottom, only visible on mobile
 * - Standard icons: Home, Search, Cart, Account
 * - Cart icon shows badge counter
 * - Search opens a search overlay
 */
const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowSearchOverlay(false);
    }
  };

  const handleSearchClick = (e) => {
    e.preventDefault();
    setShowSearchOverlay(true);
  };

  const navItems = [
    { to: '/', icon: <FiHome className="w-6 h-6" />, label: 'Home', isSearchButton: false },
    { to: '/products', icon: <FiSearch className="w-6 h-6" />, label: 'Search', onClick: handleSearchClick, isSearchButton: true },
    { to: '/cart', icon: <FiShoppingCart className="w-6 h-6" />, label: 'Cart', badge: cartCount, isSearchButton: false },
    { to: '/profile', icon: <FiUser className="w-6 h-6" />, label: 'Account', isSearchButton: false },
  ];

  return (
    <>
      {/* Search Overlay */}
      {showSearchOverlay && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] md:hidden"
          onClick={() => setShowSearchOverlay(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Search overlay"
        >
          <div
            className="absolute top-0 left-0 right-0 bg-white shadow-xl rounded-b-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{ maxHeight: '320px' }}
          >
            <div className="p-4 pb-6">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex-1">Search Products</h2>
                <button
                  onClick={() => setShowSearchOverlay(false)}
                  className="p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                  aria-label="Close search"
                >
                  <FiX className="w-6 h-6 text-gray-600" />
                </button>
              </div>
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiSearch className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for products..."
                    className="w-full h-12 pl-12 pr-4 text-base bg-gray-50 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    style={{ fontSize: '16px' }}
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  className="mt-3 w-full h-11 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-full font-medium hover:from-primary-600 hover:to-primary-700 active:scale-[0.98] transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  disabled={!searchQuery.trim()}
                >
                  Search
                </button>
              </form>
              <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                <p className="truncate">Popular: Electronics, Fashion, Home & Garden</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 bg-white/98 backdrop-blur-lg border-t-2 border-gray-200 md:hidden"
        role="navigation"
        aria-label="Bottom navigation"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.08)',
        }}
      >
        <div className="flex justify-around items-center h-16 px-2" style={{
          paddingLeft: 'max(8px, env(safe-area-inset-left))',
          paddingRight: 'max(8px, env(safe-area-inset-right))',
        }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.to && !item.isSearchButton;
            const Component = item.onClick ? 'button' : Link;
            const componentProps = item.onClick
              ? { onClick: item.onClick, type: 'button' }
              : { to: item.to };

            return (
              <Component
                key={item.to}
                {...componentProps}
                className={`flex flex-col items-center justify-center flex-1 h-full text-xs font-medium transition-all duration-200 rounded-lg mx-1 ${
                  isActive ? 'text-[color:var(--primary,#2563eb)] bg-primary-50' : 'text-gray-500 hover:bg-gray-50 active:bg-gray-100'
                }`}
                style={{
                  touchAction: 'manipulation',
                  minWidth: '44px'
                }}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className="relative flex items-center justify-center mb-1">
                  {item.icon}
                  {item.badge > 0 && item.label === 'Cart' && (
                    <CartBadge count={item.badge} className="absolute -top-2 -right-2" />
                  )}
                </div>
                <span className={isActive ? 'font-semibold' : ''}>{item.label}</span>
                {isActive && (
                  <div className="absolute top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary-600 rounded-b-full" />
                )}
              </Component>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default BottomNav;

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FiSearch, FiX } from 'react-icons/fi';

const MobileBottomNav = () => {
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
    { path: '/', icon: '🏠', label: 'Home', isSearchButton: false },
    { path: '/products', icon: '🔍', label: 'Search', onClick: handleSearchClick, isSearchButton: true },
    { path: '/cart', icon: '🛒', label: 'Cart', badge: cartCount, isSearchButton: false },
    { path: '/profile', icon: '👤', label: 'Account', isSearchButton: false },
  ];

  // Add padding to body to prevent content overlap
  React.useEffect(() => {
    const addPadding = () => {
      const safeAreaBottom = getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-bottom)') || '0px';
      const paddingValue = `calc(64px + max(${safeAreaBottom}, 8px))`;
      document.body.style.paddingBottom = paddingValue;
    };

    addPadding();
    window.addEventListener('resize', addPadding);

    return () => {
      document.body.style.paddingBottom = '0';
      window.removeEventListener('resize', addPadding);
    };
  }, []);

  return (
    <>
      {/* Search Overlay - Minimal Mobile Best Practice */}
      {showSearchOverlay && (
        <div
          className="fixed inset-0 bg-black/30 z-[60] md:hidden"
          onClick={() => setShowSearchOverlay(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Search"
        >
          <div
            className="absolute top-0 left-0 right-0 bg-white shadow-lg"
            onClick={(e) => e.stopPropagation()}
            style={{
              animation: 'slideDown 0.2s ease-out'
            }}
          >
            <div className="px-4 py-3 flex items-center gap-2">
              <form onSubmit={handleSearchSubmit} className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full h-10 pl-10 pr-3 text-sm bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white"
                    style={{ fontSize: '16px' }}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setShowSearchOverlay(false);
                      }
                    }}
                  />
                </div>
              </form>
              <button
                onClick={() => setShowSearchOverlay(false)}
                className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors"
                aria-label="Close"
              >
                <FiX className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white/98 backdrop-blur-lg border-t border-gray-200 z-50"
        style={{
          paddingBottom: 'max(env(safe-area-inset-bottom), 8px)',
          boxShadow: '0 -4px 25px rgba(0,0,0,0.08)',
          backdropFilter: 'blur(20px)'
        }}
      >
        <div className="flex justify-around items-center h-16 px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path && !item.isSearchButton;
            const Component = item.onClick ? 'button' : Link;
            const componentProps = item.onClick
              ? { onClick: item.onClick, type: 'button' }
              : { to: item.path };

            return (
              <Component
                key={item.path}
                {...componentProps}
                className={`flex flex-col items-center justify-center flex-1 h-full relative rounded-lg mx-1 transition-all duration-200 ${
                  isActive ? 'bg-primary-50' : 'hover:bg-gray-50 active:bg-gray-100'
                }`}
                style={{
                  color: isActive ? 'var(--primary-600)' : 'var(--gray-600)',
                  touchAction: 'manipulation',
                  minWidth: '44px'
                }}
              >
                <div className="relative">
                  <span className={`text-xl mb-1 transition-transform duration-200 ${
                    isActive ? 'scale-110' : ''
                  }`}>{item.icon}</span>
                  {item.badge > 0 && (
                    <span
                      className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-sm"
                      style={{ fontSize: '9px' }}
                    >
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </div>
                <span className={`text-xs font-medium transition-all duration-200 ${
                  isActive ? 'font-semibold' : ''
                }`}>{item.label}</span>
                {isActive && (
                  <div
                    className="absolute top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary-600 rounded-b-full"
                  />
                )}
              </Component>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default MobileBottomNav;

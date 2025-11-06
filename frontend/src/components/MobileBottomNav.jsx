import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const MobileBottomNav = () => {
  const location = useLocation();
  const { cartCount } = useCart();

  const navItems = [
    { path: '/', icon: '🏠', label: 'Home' },
    { path: '/products', icon: '🛍️', label: 'Shop' },
    { path: '/cart', icon: '🛒', label: 'Cart', badge: cartCount },
    { path: '/profile', icon: '👤', label: 'Account' },
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
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
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
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;

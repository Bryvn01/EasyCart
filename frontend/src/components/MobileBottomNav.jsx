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

  return (
    <nav 
      className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.1)'
      }}
    >
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center flex-1 h-full relative"
              style={{
                color: isActive ? 'var(--primary-600)' : 'var(--gray-600)',
                transition: 'color 200ms',
                touchAction: 'manipulation'
              }}
            >
              <span className="text-2xl mb-1">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
              {item.badge > 0 && (
                <span 
                  className="absolute top-2 right-1/4 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1"
                  style={{ fontSize: '10px' }}
                >
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
              {isActive && (
                <div 
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary-600 rounded-b-full"
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

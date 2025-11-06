import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiSearch, FiShoppingCart, FiUser } from 'react-icons/fi';
import CartBadge from './ui/CartBadge';
import { useCart } from '../context/CartContext';

/**
 * BottomNav: Mobile bottom navigation bar for EasyCart
 * - Fixed to bottom, only visible on mobile
 * - Standard icons: Home, Search, Cart, Account
 * - Cart icon shows badge counter
 */
const BottomNav = () => {
  const location = useLocation();
  const { cartCount } = useCart();
  const navItems = [
    { to: '/', icon: <FiHome />, label: 'Home' },
    { to: '/products', icon: <FiSearch />, label: 'Search' },
    { to: '/cart', icon: <FiShoppingCart />, label: 'Cart', badge: cartCount },
    { to: '/profile', icon: <FiUser />, label: 'Account' },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg flex justify-around items-center h-16 md:hidden" role="navigation" aria-label="Bottom navigation">
      {navItems.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className={`flex flex-col items-center justify-center flex-1 h-full text-xs font-medium transition-colors ${location.pathname === item.to ? 'text-[color:var(--primary,#2563eb)]' : 'text-gray-500'}`}
          aria-current={location.pathname === item.to ? 'page' : undefined}
        >
          <div className="relative flex items-center justify-center">
            {item.icon}
            {item.badge > 0 && item.label === 'Cart' && (
              <CartBadge count={item.badge} className="absolute -top-2 -right-2" />
            )}
          </div>
          <span className="mt-1">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
};

export default BottomNav;

import React from 'react';

const Footer = () => (
  <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
    <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-8 text-gray-700 dark:text-gray-200">
      <div>
        <h3 className="font-bold text-lg mb-2">EasyCart</h3>
        <p className="text-sm mb-2">Kenya's Leading Online Supermarket</p>
        <div className="flex gap-3 mt-4">
          <a href="https://facebook.com" aria-label="Facebook" className="hover:text-primary-600"><i className="fab fa-facebook-f"></i></a>
          <a href="https://twitter.com" aria-label="Twitter" className="hover:text-primary-600"><i className="fab fa-twitter"></i></a>
          <a href="https://instagram.com" aria-label="Instagram" className="hover:text-primary-600"><i className="fab fa-instagram"></i></a>
        </div>
      </div>
      <div>
        <h4 className="font-semibold mb-2">Contact</h4>
        <ul className="text-sm space-y-1">
          <li>Email: <a href="mailto:support@easycart.co.ke" className="hover:underline">support@easycart.co.ke</a></li>
          <li>Phone: <a href="tel:+254700000000" className="hover:underline">+254 700 000 000</a></li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold mb-2">Support</h4>
        <ul className="text-sm space-y-1">
          <li><a href="/help" className="hover:underline">Help Center</a></li>
          <li><a href="/returns" className="hover:underline">Returns</a></li>
          <li><a href="/shipping" className="hover:underline">Shipping Info</a></li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold mb-2">Quick Links</h4>
        <ul className="text-sm space-y-1">
          <li><a href="/products" className="hover:underline">Shop</a></li>
          <li><a href="/about" className="hover:underline">About Us</a></li>
          <li><a href="/contact" className="hover:underline">Contact</a></li>
        </ul>
      </div>
    </div>
    <div className="text-center text-xs text-gray-400 py-4 border-t border-gray-100 dark:border-gray-700">
      &copy; {new Date().getFullYear()} EasyCart. All rights reserved.
    </div>
  </footer>
);

export default Footer;

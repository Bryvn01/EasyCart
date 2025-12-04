import React from 'react';
import { Link } from 'react-router-dom';

export const About = () => (
  <div className="container mx-auto px-4 py-12 max-w-4xl">
    <h1 className="text-4xl font-bold mb-6">About EasyCart</h1>
    <div className="prose max-w-none">
      <p className="text-lg mb-4">
        EasyCart is Kenya's leading online shopping platform, bringing you quality products at competitive prices.
      </p>
      <p className="mb-4">
        We offer a wide range of products including groceries, electronics, fashion, and household items, all delivered to your doorstep.
      </p>
      <Link to="/products" className="btn btn-primary inline-block mt-4">
        Start Shopping
      </Link>
    </div>
  </div>
);

export const Contact = () => (
  <div className="container mx-auto px-4 py-12 max-w-4xl">
    <h1 className="text-4xl font-bold mb-6">Contact Us</h1>
    <div className="grid md:grid-cols-2 gap-8">
      <div>
        <h2 className="text-2xl font-semibold mb-4">Get in Touch</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">Email</h3>
            <a href="mailto:support@easycart.co.ke" className="text-primary-600 hover:underline">
              support@easycart.co.ke
            </a>
          </div>
          <div>
            <h3 className="font-semibold">Phone</h3>
            <a href="tel:+254700000000" className="text-primary-600 hover:underline">
              +254 700 000 000
            </a>
          </div>
          <div>
            <h3 className="font-semibold">Address</h3>
            <p>Nairobi, Kenya</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const Help = () => (
  <div className="container mx-auto px-4 py-12 max-w-4xl">
    <h1 className="text-4xl font-bold mb-6">Help Center</h1>
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-3">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div className="card p-4">
            <h3 className="font-semibold mb-2">How do I track my order?</h3>
            <p>Visit the <Link to="/orders" className="text-primary-600 hover:underline">Orders page</Link> to track your order status.</p>
          </div>
          <div className="card p-4">
            <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
            <p>We accept M-Pesa, Visa, and Mastercard.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const Returns = () => (
  <div className="container mx-auto px-4 py-12 max-w-4xl">
    <h1 className="text-4xl font-bold mb-6">Returns & Refunds</h1>
    <div className="prose max-w-none">
      <p className="text-lg mb-4">We offer a 7-day return policy on most items.</p>
      <h2 className="text-2xl font-semibold mb-3">Return Process</h2>
      <ol className="list-decimal pl-6 space-y-2">
        <li>Contact our support team within 7 days of delivery</li>
        <li>Provide your order number and reason for return</li>
        <li>Ship the item back in original condition</li>
        <li>Receive refund within 5-7 business days</li>
      </ol>
    </div>
  </div>
);

export const Shipping = () => (
  <div className="container mx-auto px-4 py-12 max-w-4xl">
    <h1 className="text-4xl font-bold mb-6">Shipping Information</h1>
    <div className="prose max-w-none">
      <h2 className="text-2xl font-semibold mb-3">Delivery Areas</h2>
      <p className="mb-4">We deliver to all major cities in Kenya including Nairobi, Mombasa, Kisumu, and Nakuru.</p>
      <h2 className="text-2xl font-semibold mb-3">Delivery Times</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>Nairobi: 1-2 business days</li>
        <li>Other cities: 2-4 business days</li>
      </ul>
      <h2 className="text-2xl font-semibold mb-3 mt-6">Shipping Costs</h2>
      <p>Free shipping on orders over KSh 2,000. Standard shipping: KSh 200.</p>
    </div>
  </div>
);

export const Privacy = () => (
  <div className="container mx-auto px-4 py-12 max-w-4xl">
    <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
    <div className="prose max-w-none">
      <p className="text-sm text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>
      <h2 className="text-2xl font-semibold mb-3">Information We Collect</h2>
      <p className="mb-4">We collect information you provide when creating an account, placing orders, and using our services.</p>
      <h2 className="text-2xl font-semibold mb-3">How We Use Your Information</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>Process and fulfill your orders</li>
        <li>Communicate about your orders and account</li>
        <li>Improve our services</li>
        <li>Send promotional offers (with your consent)</li>
      </ul>
      <h2 className="text-2xl font-semibold mb-3 mt-6">Data Security</h2>
      <p>We implement industry-standard security measures to protect your personal information.</p>
    </div>
  </div>
);

export const Terms = () => (
  <div className="container mx-auto px-4 py-12 max-w-4xl">
    <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>
    <div className="prose max-w-none">
      <p className="text-sm text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>
      <h2 className="text-2xl font-semibold mb-3">Acceptance of Terms</h2>
      <p className="mb-4">By using EasyCart, you agree to these terms of service.</p>
      <h2 className="text-2xl font-semibold mb-3">User Accounts</h2>
      <p className="mb-4">You are responsible for maintaining the confidentiality of your account credentials.</p>
      <h2 className="text-2xl font-semibold mb-3">Product Information</h2>
      <p className="mb-4">We strive to provide accurate product information, but cannot guarantee complete accuracy.</p>
      <h2 className="text-2xl font-semibold mb-3">Pricing</h2>
      <p>All prices are in Kenyan Shillings (KSh) and are subject to change without notice.</p>
    </div>
  </div>
);

export const Cookies = () => (
  <div className="container mx-auto px-4 py-12 max-w-4xl">
    <h1 className="text-4xl font-bold mb-6">Cookie Policy</h1>
    <div className="prose max-w-none">
      <p className="text-sm text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>
      <h2 className="text-2xl font-semibold mb-3">What Are Cookies</h2>
      <p className="mb-4">Cookies are small text files stored on your device to enhance your browsing experience.</p>
      <h2 className="text-2xl font-semibold mb-3">How We Use Cookies</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>Remember your login status</li>
        <li>Keep items in your cart</li>
        <li>Analyze site traffic and usage</li>
        <li>Personalize your experience</li>
      </ul>
      <h2 className="text-2xl font-semibold mb-3 mt-6">Managing Cookies</h2>
      <p>You can control cookies through your browser settings.</p>
    </div>
  </div>
);

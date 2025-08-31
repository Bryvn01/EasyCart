import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Common
      'loading': 'Loading...',
      'error': 'Error',
      'success': 'Success',
      'cancel': 'Cancel',
      'save': 'Save',
      'delete': 'Delete',
      'edit': 'Edit',
      'add': 'Add',
      'search': 'Search',
      'filter': 'Filter',
      'sort': 'Sort',
      'view': 'View',
      'back': 'Back',
      'next': 'Next',
      'previous': 'Previous',
      'submit': 'Submit',
      'close': 'Close',
      'confirm': 'Confirm',
      'yes': 'Yes',
      'no': 'No',
      
      // Navigation
      'home': 'Home',
      'products': 'Products',
      'cart': 'Cart',
      'orders': 'Orders',
      'profile': 'Profile',
      'admin': 'Admin',
      'login': 'Login',
      'logout': 'Logout',
      'register': 'Register',
      
      // Products
      'addToCart': 'Add to Cart',
      'outOfStock': 'Out of Stock',
      'inStock': 'In Stock',
      'price': 'Price',
      'quantity': 'Quantity',
      'category': 'Category',
      'description': 'Description',
      'reviews': 'Reviews',
      'rating': 'Rating',
      
      // Cart & Orders
      'total': 'Total',
      'subtotal': 'Subtotal',
      'shipping': 'Shipping',
      'tax': 'Tax',
      'checkout': 'Checkout',
      'orderHistory': 'Order History',
      'orderStatus': 'Order Status',
      
      // User
      'username': 'Username',
      'email': 'Email',
      'password': 'Password',
      'confirmPassword': 'Confirm Password',
      'firstName': 'First Name',
      'lastName': 'Last Name',
      'phone': 'Phone',
      'address': 'Address',
      
      // Admin
      'dashboard': 'Dashboard',
      'totalOrders': 'Total Orders',
      'totalRevenue': 'Total Revenue',
      'activeCustomers': 'Active Customers',
      'topProducts': 'Top Products',
      'recentOrders': 'Recent Orders',
      'salesAnalytics': 'Sales Analytics'
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  })
  .catch(error => {
    console.error('i18n initialization failed:', error);
  });

export default i18n;
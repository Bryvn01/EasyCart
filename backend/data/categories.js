/**
 * Categories data for seeding the database
 * @module data/categories
 */

/**
 * @typedef {Object} Category
 * @property {string} name - The name of the category
 * @property {string} description - A brief description of the category
 */

/**
 * Array of categories to seed the database
 * @type {Category[]}
 */
const categories = [
  { name: 'Electronics', description: 'Electronic devices and gadgets' },
  { name: 'Fashion', description: 'Clothing and accessories' },
  { name: 'Home & Living', description: 'Home decor and furniture' },
  { name: 'Food & Beverages', description: 'Food items and drinks' },
  { name: 'Health & Beauty', description: 'Health and beauty products' },
  { name: 'Sports & Fitness', description: 'Sports equipment and fitness gear' },
  { name: 'Groceries', description: 'Daily grocery items' },
  { name: 'Beverages', description: 'Drinks and beverages' },
  { name: 'Household', description: 'Household cleaning and maintenance' },
  { name: 'Personal Care', description: 'Personal hygiene and care products' }
];

module.exports = categories;

import posthog from 'posthog-js';

// Initialize PostHog
if (typeof window !== 'undefined') {
  posthog.init(process.env.REACT_APP_POSTHOG_KEY || 'phc_demo_key', {
    api_host: process.env.REACT_APP_POSTHOG_HOST || 'https://app.posthog.com'
  });
}

export const analytics = {
  track: (event, properties = {}) => {
    if (typeof window !== 'undefined') {
      posthog.capture(event, properties);
    }
  },
  
  identify: (userId, traits = {}) => {
    if (typeof window !== 'undefined') {
      posthog.identify(userId, traits);
    }
  },
  
  page: (name, properties = {}) => {
    if (typeof window !== 'undefined') {
      posthog.capture('$pageview', { page: name, ...properties });
    }
  }
};

// Track common e-commerce events
export const trackEvent = {
  productView: (product) => analytics.track('Product Viewed', {
    product_id: product.id,
    product_name: product.name,
    category: product.category,
    price: product.price
  }),
  
  addToCart: (product, quantity = 1) => analytics.track('Product Added to Cart', {
    product_id: product.id,
    product_name: product.name,
    price: product.price,
    quantity
  }),
  
  purchase: (order) => analytics.track('Purchase Completed', {
    order_id: order.id,
    revenue: order.total,
    products: order.items?.length || 0
  }),
  
  search: (query, results = 0) => analytics.track('Products Searched', {
    search_query: query,
    results_count: results
  })
};
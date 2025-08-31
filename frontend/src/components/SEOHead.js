import { useEffect } from 'react';

const SEOHead = ({ 
  title = 'Easycart - Quality Kenyan Products', 
  description = 'Shop quality Kenyan products at great prices. Fast delivery, secure payments with M-Pesa, Airtel Money and cards.',
  keywords = 'Kenya, ecommerce, online shopping, M-Pesa, products, delivery',
  image = '/logo192.png'
}) => {
  useEffect(() => {
    // Update title
    document.title = title;
    
    // Update meta tags
    const updateMeta = (name, content) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = name;
        document.head.appendChild(meta);
      }
      meta.content = content;
    };
    
    const updateProperty = (property, content) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };
    
    // Basic meta tags
    updateMeta('description', description);
    updateMeta('keywords', keywords);
    
    // Open Graph tags
    updateProperty('og:title', title);
    updateProperty('og:description', description);
    updateProperty('og:image', image);
    updateProperty('og:type', 'website');
    
    // Twitter tags
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', title);
    updateMeta('twitter:description', description);
    updateMeta('twitter:image', image);
    
  }, [title, description, keywords, image]);
  
  return null;
};

export default SEOHead;
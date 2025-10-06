import React from 'react';
import ImageWithFallback from './ImageWithFallback';

const banners = [
  {
    image: 'https://images.pexels.com/photos/3230214/pexels-photo-3230214.jpeg?auto=compress&cs=tinysrgb&w=1280',
    alt: 'Fresh bananas and tropical fruits at market',
    link: '/flash-sales',
    photographer: 'Kai Pilger',
  },
  {
    image: 'https://images.pexels.com/photos/365810/pexels-photo-365810.jpeg?auto=compress&cs=tinysrgb&w=1280',
    alt: 'Variety of fresh vegetables and produce on display',
    link: '/groceries',
    photographer: 'Laura James',
  },
  {
    image: 'https://images.pexels.com/photos/3714083/pexels-photo-3714083.jpeg?auto=compress&cs=tinysrgb&w=1280',
    alt: 'Modern electronics and gadgets display',
    link: '/tv-deals',
    photographer: 'Tom Fisk',
  },
  {
    image: 'https://images.pexels.com/photos/7129147/pexels-photo-7129147.jpeg?auto=compress&cs=tinysrgb&w=1280',
    alt: 'Variety of drinks and beverages on display',
    link: '/phone-deals',
    photographer: 'Igor Starkov',
  },
];

const BannerCarousel = () => {
  const [current, setCurrent] = React.useState(0);
  React.useEffect(() => {
    const timer = setInterval(() => setCurrent((c) => (c + 1) % banners.length), 4000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="w-full h-48 sm:h-64 md:h-80 lg:h-96 relative overflow-hidden rounded-lg mb-6">
      {banners.map((banner, idx) => (
        <a
          key={banner.image}
          href={banner.link}
          className={`absolute inset-0 transition-opacity duration-700 ${idx === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
        >
          <ImageWithFallback
            src={banner.image}
            alt={banner.alt}
            fallbackCategory="hero"
            showSkeleton
            className="w-full h-full"
            style={{ objectFit: 'cover' }}
            draggable="false"
          />
        </a>
      ))}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        {banners.map((_, idx) => (
          <button
            key={idx}
            className={`w-2.5 h-2.5 rounded-full ${idx === current ? 'bg-primary' : 'bg-white border border-primary'}`}
            onClick={() => setCurrent(idx)}
            aria-label={`Go to banner ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default BannerCarousel;

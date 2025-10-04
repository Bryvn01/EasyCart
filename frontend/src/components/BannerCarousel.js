import React from 'react';
import ImageWithFallback from './ImageWithFallback';

const banners = [
  {
    image: 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse3.mm.bing.net%2Fth%2Fid%2FOIP.VGlj6JIHNUYt3mgQvyQGOQHaEO%3Fpid%3DApi&f=1&ipt=1c3dee8b72e82617a1cf02129407e401a51f6158e91c74a3b00f31a810d197f1&ipo=images',
    alt: 'Flash Sale',
    link: '/flash-sales',
  },
  {
    image: 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse4.mm.bing.net%2Fth%2Fid%2FOIP.eQcgkOfW3IIcPMsY6nFU6gHaEo%3Fpid%3DApi&f=1&ipt=875cd6398badb3dfc0c8c0a5031bdbaa13259c90523543a2e0a7bfb47af00aba&ipo=images',
    alt: 'Grocery Essentials',
    link: '/groceries',
  },
  {
    image: 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse3.mm.bing.net%2Fth%2Fid%2FOIP.-8D-aTX5L3YKOqk0cVtsbgHaGu%3Fpid%3DApi&f=1&ipt=cc6b19ac478a979118cdaee5def31c9b855e54307d13506874eaf540267d490a&ipo=images',
    alt: 'TV Deals',
    link: '/tv-deals',
  },
  {
    image: 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse4.mm.bing.net%2Fth%2Fid%2FOIP.vvXM54xN_PBcWrAOP0wXtgHaEL%3Fpid%3DApi&f=1&ipt=a575c8ec5fdca17e77b8e254690eed911cb8997d5dcc60679cb3c38400d94bdc&ipo=images',
    alt: 'Phone Deals',
    link: '/phone-deals',
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

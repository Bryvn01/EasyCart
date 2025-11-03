import React from 'react';

const FeaturedIn = () => {
  const mediaOutlets = [
    { name: 'Daily Nation', logo: '📰' },
    { name: 'The Standard', logo: '📄' },
    { name: 'Business Daily', logo: '💼' },
    { name: 'Citizen TV', logo: '📺' },
    { name: 'KTN News', logo: '🎥' },
    { name: 'Capital FM', logo: '📻' }
  ];

  return (
    <section className="featured-in bg-white py-8 border-t border-b border-gray-200">
      <div className="container mx-auto px-4">
        <h3 className="text-center text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">
          As Featured In
        </h3>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-6 items-center justify-items-center">
          {mediaOutlets.map((outlet, index) => (
            <div
              key={index}
              className="flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
            >
              <span className="text-4xl">{outlet.logo}</span>
              <span className="text-xs font-medium text-gray-600 text-center">
                {outlet.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedIn;

import React from 'react';

const TrustBadges = ({ variant = 'horizontal' }) => {
  const badges = [
    {
      icon: '🔒',
      title: 'Secure SSL Payments',
      subtitle: '256-bit encryption'
    },
    {
      icon: '🚚',
      title: 'Fast Delivery in Kenya',
      subtitle: 'Same-day in Nairobi'
    },
    {
      icon: '↩️',
      title: 'Easy Returns',
      subtitle: '30-day guarantee'
    },
    {
      icon: '🛡️',
      title: 'Warranty Protected',
      subtitle: '100% genuine products'
    }
  ];

  return (
    <div 
      className={`trust-badges ${
        variant === 'vertical' ? 'flex flex-col gap-3' : 'grid grid-cols-2 md:grid-cols-4 gap-3'
      }`}
      style={{ padding: '16px 0' }}
    >
      {badges.map((badge, index) => (
        <div
          key={index}
          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-primary-300 transition-colors"
        >
          <span className="text-2xl flex-shrink-0">{badge.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-gray-900 truncate">
              {badge.title}
            </div>
            <div className="text-xs text-gray-600 truncate">
              {badge.subtitle}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TrustBadges;

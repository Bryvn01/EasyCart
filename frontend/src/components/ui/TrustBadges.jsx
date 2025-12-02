import React from 'react';

/**
 * TrustBadges - Enterprise-grade trust indicators
 * 
 * Features:
 * - PWA-compliant SVG icons (no emojis)
 * - Responsive grid layout
 * - Accessibility compliant (proper labels, contrast)
 * - Hover effects with smooth transitions
 */
const TrustBadges = ({ variant = 'horizontal', compact = false }) => {
  const badges = [
    {
      icon: (
        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      title: 'Secure Payments',
      subtitle: '256-bit SSL encryption',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: (
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
      title: 'Fast Delivery',
      subtitle: 'Same-day in Nairobi',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: (
        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      title: 'Easy Returns',
      subtitle: '30-day guarantee',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      icon: (
        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: '100% Genuine',
      subtitle: 'Quality guaranteed',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  if (compact) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-4 py-4">
        {badges.map((badge, index) => (
          <div
            key={index}
            className="flex items-center gap-2 text-sm text-gray-600"
          >
            <span className={badge.color}>{badge.icon}</span>
            <span className="font-medium">{badge.title}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={`trust-badges-container ${
        variant === 'vertical' ? 'flex flex-col gap-3' : 'grid grid-cols-2 md:grid-cols-4 gap-3'
      }`}
      style={{ padding: '16px 0' }}
      role="list"
      aria-label="Trust and security features"
    >
      {badges.map((badge, index) => (
        <div
          key={index}
          className={`flex items-center gap-3 p-4 ${badge.bgColor} rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-200 group`}
          role="listitem"
        >
          <div className={`flex-shrink-0 p-2 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-shadow`}>
            {badge.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-gray-900">
              {badge.title}
            </div>
            <div className="text-xs text-gray-600">
              {badge.subtitle}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TrustBadges;

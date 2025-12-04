import React from 'react';

export const ProductCardSkeleton = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <div className="aspect-square bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%]"></div>
    <div className="p-4 space-y-3">
      <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%] rounded w-1/3"></div>
      <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%] rounded w-3/4"></div>
      <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%] rounded w-1/2"></div>
      <div className="flex items-center gap-2">
        <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%] rounded w-20"></div>
        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%] rounded w-16"></div>
      </div>
      <div className="flex gap-2">
        <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%] rounded flex-1"></div>
      </div>
    </div>
  </div>
);

export const CategoryCardSkeleton = () => (
  <div className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
    <div className="aspect-square bg-gray-200"></div>
    <div className="p-3">
      <div className="h-4 bg-gray-200 rounded mx-auto w-3/4"></div>
    </div>
  </div>
);

export const HeroSkeleton = () => (
  <div className="bg-gray-200 animate-pulse">
    <div className="container mx-auto max-w-7xl px-4 py-24">
      <div className="space-y-4 max-w-xl">
        <div className="h-12 bg-gray-300 rounded w-3/4"></div>
        <div className="h-8 bg-gray-300 rounded w-full"></div>
        <div className="flex gap-4">
          <div className="h-12 bg-gray-300 rounded w-32"></div>
          <div className="h-12 bg-gray-300 rounded w-32"></div>
        </div>
      </div>
    </div>
  </div>
);

export const ProductGridSkeleton = ({ count = 12 }) => (
  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);

export const CategoryGridSkeleton = ({ count = 6 }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <CategoryCardSkeleton key={i} />
    ))}
  </div>
);

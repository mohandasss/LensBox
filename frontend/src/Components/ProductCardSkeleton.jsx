import React from 'react';

const ProductCardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 animate-pulse">
      {/* Image Skeleton */}
      <div className="aspect-square bg-gray-200 w-full relative">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 animate-pulse"></div>
      </div>
      
      {/* Content Skeleton */}
      <div className="p-4">
        {/* Category Badge Skeleton */}
        <div className="h-4 w-20 bg-gray-200 rounded-full mb-2"></div>
        
        {/* Title Skeleton */}
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
        
        {/* Rating Skeleton */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-4 h-4 bg-gray-200 rounded-full mr-1"></div>
            ))}
          </div>
          <div className="h-3 w-10 bg-gray-200 rounded ml-1"></div>
        </div>
        
        {/* Price Skeleton */}
        <div className="flex items-center mt-3">
          <div className="h-6 w-16 bg-gray-200 rounded"></div>
          <div className="h-4 w-10 bg-gray-200 rounded ml-2"></div>
        </div>
        
        {/* Button Skeleton */}
        <div className="mt-4 h-10 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;

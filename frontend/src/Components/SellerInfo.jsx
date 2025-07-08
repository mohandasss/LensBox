import React, { useState, useEffect } from 'react';
import { getSellerInfo } from '../APIs/ProductAPI';
import { getSellerRatings } from '../APIs/SellerAPI';
import { FaStar, FaUserCircle } from 'react-icons/fa';

const SellerInfo = ({ productId }) => {
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSellerInfo = async () => {
      if (!productId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch seller info
        const data = await getSellerInfo(productId);

        console.log("data", data);
        if (!data || !data.seller) {
          throw new Error('No seller information available');
        }

        setSeller(data.seller);

        // Fetch seller ratings
      } catch (err) {
        console.error('Error in SellerInfo:', err);
        setError(err.message || 'Failed to load seller information');
      } finally {
        setLoading(false);
      }
    };

    fetchSellerInfo();
  }, [productId]);

  // Loading state
  if (loading) {
    return (
      <div className="mt-6 flex items-center gap-4 p-4 border border-gray-100 rounded-xl bg-white">
        <div className="w-11 h-11 rounded-full bg-gray-100 animate-pulse"></div>
        <div className="flex-1 space-y-2">
          <div className="h-3 w-16 bg-gray-100 rounded animate-pulse"></div>
          <div className="h-4 w-28 bg-gray-100 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  // No seller data
  if (!seller) {
    return null;
  }

  return (
    <div className="mt-6 p-4 border border-gray-100 rounded-xl bg-white hover:shadow-sm transition-shadow duration-200">
      <div className="flex items-center gap-4">
        {/* Profile Picture */}
        <div className="relative flex-shrink-0">
          {seller.profilePic ? (
            <img
              src={seller.profilePic}
              alt={seller.name}
              className="w-11 h-11 rounded-full object-cover ring-2 ring-gray-50"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/44';
              }}
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center">
              <FaUserCircle size={28} className="text-gray-400" />
            </div>
          )}
        </div>

        {/* Seller Info */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
            Sold by
          </p>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900 truncate">
              {seller.name || 'Unknown Seller'}
            </h3>

            {(seller.averageRating > 0 || seller.totalRatings > 0) && (
              <div className="flex items-center gap-1.5 ml-3 flex-shrink-0">
                <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-full">
                  <FaStar className="text-amber-400 w-3 h-3" />
                  <span className="text-xs font-medium text-gray-700">
                    {seller.averageRating.toFixed(1)}
                  </span>
                </div>
                <span className="text-xs text-gray-400">
                  ({seller.totalRatings})
                </span>
              </div>
            )}
          </div>

          {seller.error && (
            <p className="text-xs text-red-500 mt-1">{seller.error}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerInfo;
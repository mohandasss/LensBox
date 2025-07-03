import React, { useState, useEffect } from 'react';
import { getSellerInfo } from '../APIs/ProductAPI';
import { FaStar } from 'react-icons/fa';

const SellerInfo = ({ productId }) => {
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const fetchSellerInfo = async () => {
      try {
        const data = await getSellerInfo(productId);
        setSeller(data.seller);
      } catch (err) {
        console.error('Error fetching seller info:', err);
        setError('Failed to load seller information');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchSellerInfo();
    }
  }, [productId]);

  if (loading) return <div className="mt-4 text-sm text-gray-500">Loading seller info...</div>;
  if (error) return <div className="mt-4 text-sm text-red-500">{error}</div>;
  if (!seller) return null;

  return (
    <div className="mt-4 flex items-center">
      <div className="relative">
        <img
          src={seller.profilePic || 'https://via.placeholder.com/40'}
          alt={seller.name}
          className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        />
        {showTooltip && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
            {seller.name}
          </div>
        )}
      </div>
      
      <div className="ml-3">
        <div className="flex items-center">
          <FaStar className="text-yellow-400 mr-1" />
          <span className="text-sm font-medium text-gray-800">
            {seller.averageRating.toFixed(1)}
          </span>
          <span className="mx-1 text-gray-400">•</span>
          <span className="text-xs text-gray-500">
            {seller.totalRatings} {seller.totalRatings === 1 ? 'rating' : 'ratings'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SellerInfo;

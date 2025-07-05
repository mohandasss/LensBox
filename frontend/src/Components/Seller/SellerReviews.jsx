import React, { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, MessageSquare, User } from 'lucide-react';
import { getSellerReviews } from '../../APIs/SellerAPI';

const SellerReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalReviews: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReviews = async (page = 1) => {
    try {
      setLoading(true);
      const response = await getSellerReviews(page, 10);
      console.log('⭐ Fetched reviews:', response);
      setReviews(response.reviews);
      setPagination(response.pagination);
      setError(null);
    } catch (error) {
      console.error('❌ Error fetching reviews:', error);
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(1);
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchReviews(newPage);
    }
  };

  // Helper function to generate profile picture initials
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Helper function to generate profile picture background color
  const getProfileColor = (name) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 
      'bg-indigo-500', 'bg-yellow-500', 'bg-red-500', 'bg-teal-500'
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Product Reviews</h2>
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2 text-gray-600">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span>Loading reviews...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Product Reviews</h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Product Reviews</h2>
        <div className="text-sm text-gray-600">
          Total Reviews: <span className="font-semibold">{pagination.totalReviews}</span>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6 mb-6">
        {reviews.map((review) => (
          <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
            <div className="flex items-start space-x-4">
              {/* User Profile Picture */}
              <div className="flex-shrink-0">
                {review.userProfilePic ? (
                  <img 
                    src={review.userProfilePic} 
                    alt={review.user}
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className={`w-12 h-12 rounded-full ${getProfileColor(review.user)} flex items-center justify-center text-white font-semibold text-sm ${review.userProfilePic ? 'hidden' : ''}`}>
                  {getInitials(review.user)}
                </div>
              </div>

              {/* Review Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-gray-900">{review.user}</h4>
                    <p className="text-sm text-gray-500">{review.product}</p>
                    {review.userEmail && (
                      <p className="text-xs text-gray-400">{review.userEmail}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                </div>
                
                <p className="text-gray-700 mb-2 leading-relaxed">{review.comment}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{review.date}</span>
                  <span>{review.timeAgo}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Empty State */}
        {reviews.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">No reviews yet</h3>
            <p className="text-xs text-gray-500">Reviews will appear here once customers start rating your products.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
          <div className="text-sm text-gray-700">
            Showing page {pagination.currentPage} of {pagination.totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrevPage}
              className={`p-2 rounded-lg border ${
                pagination.hasPrevPage
                  ? 'border-gray-300 hover:bg-gray-50 text-gray-700'
                  : 'border-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <span className="text-sm text-gray-700 px-3">
              {pagination.currentPage} / {pagination.totalPages}
            </span>
            
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage}
              className={`p-2 rounded-lg border ${
                pagination.hasNextPage
                  ? 'border-gray-300 hover:bg-gray-50 text-gray-700'
                  : 'border-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerReviews;

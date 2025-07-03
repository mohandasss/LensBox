import React from 'react';
import { FaStar, FaUserCircle } from 'react-icons/fa';
import { format } from 'date-fns';

const ReviewList = ({ reviews }) => {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Reviews</h3>
        <p className="text-gray-500">No reviews yet. Be the first to review!</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Reviews ({reviews.length})
      </h3>
      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review._id} className="border-b border-gray-200 pb-6 last:border-0">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {review.user?.profilePic ? (
                  <img
                    src={review.user.profilePic}
                    alt={review.user.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <FaUserCircle className="h-10 w-10 text-gray-400" />
                )}
              </div>
              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">
                    {review.user?.name || 'Anonymous'}
                  </h4>
                  <span className="text-sm text-gray-500">
                    {format(new Date(review.createdAt), 'MMM d, yyyy')}
                  </span>
                </div>
                <div className="flex items-center mt-1">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={`h-4 w-4 ${
                        i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="mt-2 text-gray-600">{review.comment}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewList;

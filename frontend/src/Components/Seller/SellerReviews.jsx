import React from 'react';
import { Star } from 'lucide-react';

const SellerReviews = () => {
  const reviews = [
    {
      id: 1,
      user: 'John Doe',
      rating: 5,
      comment: 'Great product! Very satisfied with the quality and service.',
      date: '2 days ago',
      product: 'Canon EOS R5'
    },
    {
      id: 2,
      user: 'Jane Smith',
      rating: 4,
      comment: 'Good condition, fast delivery. Would rent again!',
      date: '1 week ago',
      product: 'Sony A7III'
    },
    {
      id: 3,
      user: 'Mike Johnson',
      rating: 5,
      comment: 'Excellent camera, worked perfectly for my project.',
      date: '2 weeks ago',
      product: 'Nikon Z6'
    }
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Product Reviews</h2>
      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-gray-900">{review.user}</h4>
                <p className="text-sm text-gray-500">{review.product}</p>
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
            <p className="mt-2 text-gray-700">{review.comment}</p>
            <p className="mt-2 text-sm text-gray-500">{review.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SellerReviews;

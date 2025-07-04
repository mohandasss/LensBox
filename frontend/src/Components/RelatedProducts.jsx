import React from 'react';
import { useNavigate } from 'react-router-dom';

const RelatedProducts = ({ products }) => {
  const navigate = useNavigate();

  if (!products || products.length === 0) {
    return <div className="text-gray-400 text-sm text-center">No related products found.</div>;
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {products.map((product) => (
        <div
          key={product._id}
          className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition"
          onClick={() => navigate(`/product/${product._id}`)}
        >
          <img
            src={Array.isArray(product.image) ? product.image[0] : product.image}
            alt={product.name}
            className="w-16 h-16 object-cover rounded-md border border-gray-200"
          />
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-sm font-medium text-gray-800 truncate">{product.name}</span>
            <span className="text-xs text-gray-500 mt-1">₹{product.price}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RelatedProducts; 
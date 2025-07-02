import React from 'react';
import ProductPerformance from './ProductPerformance';

const SellerProducts = () => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Your Products</h2>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
          <span>+ Add Product</span>
        </button>
      </div>
      <ProductPerformance />
    </div>
  );
};

export default SellerProducts;

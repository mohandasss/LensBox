import React from 'react';
import RecentOrders from './RecentOrders';

const SellerOrders = () => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Management</h2>
      <RecentOrders showAll={true} />
    </div>
  );
};

export default SellerOrders;

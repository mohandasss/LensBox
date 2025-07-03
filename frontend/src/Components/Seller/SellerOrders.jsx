import React, { useState, useEffect } from 'react';
import RecentOrders from './RecentOrders';
import { getSellerRecentOrders } from '../../APIs/SellerAPI';

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        // Fetch more orders for the orders tab (20 instead of 5)
        const orderData = await getSellerRecentOrders(20);
        console.log('📋 Fetched orders for Orders tab:', orderData);
        setOrders(orderData);
        setError(null);
      } catch (error) {
        console.error('❌ Error fetching orders:', error);
        setError('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Management</h2>
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2 text-gray-600">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span>Loading orders...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Management</h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Management</h2>
      <div className="mb-4">
        <p className="text-gray-600">Total Orders: <span className="font-semibold">{orders.length}</span></p>
      </div>
      <RecentOrders data={orders} showAll={true} />
    </div>
  );
};

export default SellerOrders;

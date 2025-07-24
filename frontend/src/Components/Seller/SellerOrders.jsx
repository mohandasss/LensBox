import React, { useState, useEffect } from 'react';
import { getSellerOrders } from '../../APIs/SellerAPI';
import { CheckCircle, Clock, XCircle, ShoppingCart, ChevronLeft, ChevronRight, User } from 'lucide-react';
import OrderStatusUpdater from './OrderStatusUpdater';
import { verifyToken } from '../../APIs/AuthAPI';
const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const { user } = await verifyToken(token);
      
      if (!user || !user._id) {
        throw new Error('User not authenticated');
      }
      
      const response = await getSellerOrders(page, 10, user._id);
      console.log('📋 Fetched orders for Orders tab:', response);
      
      // Ensure orders have both _id and id if needed, and robustly normalize status
      const processedOrders = response.data.map(order => {
        // Prefer status, then orderStatus, then fallback to 'confirmed'
        const normalizedStatus = order.status || order.orderStatus || 'confirmed';
        return {
          ...order,
          id: order._id, // Add id field if your frontend expects it
          status: normalizedStatus
        };
      });
      
      setOrders(processedOrders);
      setPagination(response.pagination);
      setError(null);
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(1);
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchOrders(newPage);
    }
  };

  // Add status update handler for local state update
  const handleStatusUpdate = (orderId, newStatus) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        (order.id === orderId || order._id === orderId)
          ? { ...order, status: newStatus }
          : order
      )
    );
  };

  const getStatusBadge = (status) => {
    switch(status?.toLowerCase()) {
      case 'active': 
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
      case 'completed':
      case 'confirmed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Confirmed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <Clock className="w-3 h-3 mr-1" />
            {status || 'Unknown'}
          </span>
        );
    }
  };

  // Helper function to generate profile picture initials
  const getInitials = (name) => {
    if (!name) return ""; // Prevent errors if name is undefined/null
    return name
      .split(' ')
      .filter(Boolean)
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
    if (!name) return colors[0]; // Default color if name is missing
    const index = name.length % colors.length;
    return colors[index];
  };

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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
        <div className="text-sm text-gray-600">
          Total Orders: <span className="font-semibold">{pagination.total}</span>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4 mb-6">
        {orders.map((order) => (
          <div key={order.id || order._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            {/* Left Side - Profile + Customer Info */}
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              {/* Profile Picture */}
              <div className="relative">
                {order.customerDetails?.profilePic ? (
                  <img 
                    src={order.customerDetails.profilePic} 
                    alt={order.customerDetails.fullName}
                    className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const fallback = e.target.nextElementSibling;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className={`w-10 h-10 rounded-full ${getProfileColor(order.customerDetails?.fullName || '')} flex items-center justify-center text-white font-semibold text-sm ${order.customerDetails?.profilePic ? 'hidden' : ''}`}
                >
                  {getInitials(order.customerDetails?.fullName || '')}
                </div>
              </div>
              {/* Customer & Product Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {order.customerDetails?.fullName}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {order.items && order.items.length > 0 ? order.items[0].productId.name : ''}
                </p>
              </div>
            </div>
            {/* Center - Amount */}
            <div className="flex-shrink-0 mx-4">
              <p className="text-sm font-semibold text-gray-900">
                ₹{order.total?.toLocaleString()}
              </p>
            </div>
            {/* Right Side - Status & Date */}
            <div className="flex-shrink-0 text-right">
              <div className="mb-2">
                <OrderStatusUpdater 
                  order={{
                    ...order,
                    id: order.id || order._id,
                    status: order.status || order.orderStatus,
                    customer: order.customerDetails?.fullName || '',
                  }}
                  onStatusUpdate={handleStatusUpdate}
                />
              </div>
              <p className="text-xs text-gray-500">
                {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ''}
              </p>
            </div>
          </div>
        ))}
        {/* Empty State */}
        {orders.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <ShoppingCart className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">No orders yet</h3>
            <p className="text-xs text-gray-500">Orders will appear here once customers start purchasing.</p>
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

export default SellerOrders;
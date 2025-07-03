import React from 'react';
import { CheckCircle, Clock, XCircle, ShoppingCart } from 'lucide-react';

const RecentOrders = ({ data = [], showAll = false }) => {
  // Fallback data if no data is provided
  const fallbackOrders = [
    { id: '#12345', customer: 'John Doe', product: 'Canon EOS R5', amount: 299, status: 'active', date: '2 hours ago' },
    { id: '#12344', customer: 'Jane Smith', product: 'Sony A7III', amount: 249, status: 'pending', date: '5 hours ago' },
    { id: '#12343', customer: 'Mike Johnson', product: 'Nikon Z6', amount: 199, status: 'completed', date: '1 day ago' },
    { id: '#12342', customer: 'Sarah Wilson', product: 'Fuji X-T4', amount: 279, status: 'active', date: '2 days ago' },
    { id: '#12341', customer: 'David Brown', product: 'Sony 24-70mm', amount: 99, status: 'completed', date: '3 days ago' },
  ];
  
  const orders = data.length > 0 ? data : fallbackOrders;

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

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
        {!showAll && (
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View All
          </button>
        )}
      </div>
      
      {/* Compact Card-based Layout - No Scrollbars */}
      <div className="space-y-4">
        {orders.slice(0, showAll ? orders.length : 5).map((order) => (
          <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            {/* Left Side - Profile + Customer Info */}
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              {/* Profile Picture */}
              <div className={`w-10 h-10 rounded-full ${getProfileColor(order.customer)} flex items-center justify-center text-white font-semibold text-sm`}>
                {getInitials(order.customer)}
              </div>
              
              {/* Customer & Product Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {order.customer}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {order.product}
                </p>
              </div>
            </div>
            
            {/* Center - Amount */}
            <div className="flex-shrink-0 mx-4">
              <p className="text-sm font-semibold text-gray-900">
                ₹{order.amount?.toLocaleString()}
              </p>
            </div>
            
            {/* Right Side - Status & Date */}
            <div className="flex-shrink-0 text-right">
              <div className="mb-1">
                {getStatusBadge(order.status)}
              </div>
              <p className="text-xs text-gray-500">
                {order.date}
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
    </div>
  );
};

export default RecentOrders;

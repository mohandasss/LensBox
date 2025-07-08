import React, { useState } from 'react';
import { ChevronDown, CheckCircle, Truck, Package, XCircle, Loader2 } from 'lucide-react';
import { updateOrderStatus } from '../../APIs/SellerAPI';
import { useNotification } from '../NotificationSystem';

const OrderStatusUpdater = ({ order, onStatusUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { showSuccess, showError } = useNotification();

  const statusOptions = [
    { value: 'confirmed', label: 'Confirmed', icon: CheckCircle, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { value: 'shipped', label: 'Shipped', icon: Truck, color: 'text-orange-600', bgColor: 'bg-orange-50' },
    { value: 'delivered', label: 'Delivered', icon: Package, color: 'text-green-600', bgColor: 'bg-green-50' },
    { value: 'cancelled', label: 'Cancelled', icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-50' }
  ];

  const currentStatus = statusOptions.find(option => option.value === order.status) || statusOptions[0];
  const CurrentIcon = currentStatus.icon;

  const handleStatusUpdate = async (newStatus) => {
    console.log('newStatus', newStatus);
    console.log('order.status', order.id);
    if (newStatus === order.status) {
      setIsOpen(false);
      return;
    }

    setIsUpdating(true);
    try {
      const response = await updateOrderStatus(order._id, newStatus);

      if (response.success) {
        showSuccess(
          'Status Updated',
          `Order status changed to ${newStatus}. Email notification sent to customer.`
        );

        // Call the parent callback to update the order in the list
        if (onStatusUpdate) {
          onStatusUpdate(order._id, newStatus);
        }
      } else {
        showError('Update Failed', response.message || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      showError(
        'Update Failed',
        error.response?.data?.message || 'Failed to update order status'
      );
    } finally {
      setIsUpdating(false);
      setIsOpen(false);
    }
  };

  const getNextValidStatuses = (currentStatus) => {
    const statusFlow = {
      'confirmed': ['shipped', 'cancelled'],
      'shipped': ['delivered', 'cancelled'],
      'delivered': [], // Can't change from delivered
      'cancelled': [] // Can't change from cancelled
    };
    return statusFlow[currentStatus] || [];
  };

  const nextValidStatuses = getNextValidStatuses(order.status);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isUpdating}
        className={`
          flex items-center space-x-2 px-3 py-1.5 rounded-lg border transition-all duration-200
          ${currentStatus.bgColor} ${currentStatus.color} border-current/20
          hover:shadow-md hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        {isUpdating ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <CurrentIcon className="w-4 h-4" />
        )}
        <span className="text-sm font-medium capitalize">
          {isUpdating ? 'Updating...' : currentStatus.label}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="py-1">
            {nextValidStatuses.length > 0 ? (
              nextValidStatuses.map((status) => {
                const option = statusOptions.find(opt => opt.value === status);
                const OptionIcon = option.icon;

                return (
                  <button
                    key={status}
                    onClick={() => handleStatusUpdate(status)}
                    disabled={isUpdating}
                    className={`
                      w-full flex items-center space-x-3 px-4 py-2 text-left transition-colors duration-150
                      hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed
                      ${option.color}
                    `}
                  >
                    <OptionIcon className="w-4 h-4" />
                    <span className="text-sm font-medium capitalize">{option.label}</span>
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-2 text-sm text-gray-500">
                No further status changes allowed
              </div>
            )}
          </div>
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default OrderStatusUpdater; 
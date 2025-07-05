import React from 'react';
import { downloadInvoice } from '../APIs/OrderAPI';
import { FaFileInvoice, FaDownload } from 'react-icons/fa';
import InvoiceModal from './InvoiceModal'; // Import the modal

const OrderDetails = ({ order }) => {
  const formatPrice = (value) => {
    if (value === undefined || value === null) return '0.00';
    const num = Number(value);
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  const orderStatus = order.status || 'confirmed';
  
  // Match seller side status colors
  const getStatusBadge = (status) => {
    switch(status?.toLowerCase()) {
      case 'delivered':
        return (
          <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-green-50 text-green-700 border border-green-200">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Delivered
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-orange-50 text-orange-700 border border-orange-200">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1V9a1 1 0 00-1-1h-3z" />
            </svg>
            Shipped
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Confirmed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-red-50 text-red-700 border border-red-200">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-50 text-gray-700 border border-gray-200">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            {status || 'Pending'}
          </span>
        );
    }
  };

  const { customerDetails = {}, items = [], razorpay = {}, total = 0 } = order;

  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [pdfBlob, setPdfBlob] = React.useState(null);

  const onDownloadInvoice = async () => {
    if (!order?._id) return;
    setIsModalOpen(true);
    setIsGenerating(true);

    
  };

  const downloadNow = () => {
    if (!pdfBlob) return;
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice-${order._id}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
    setIsModalOpen(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200 hover:shadow-lg transition-all duration-300">
      {/* Order Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            Order #{order._id?.toString().slice(-6) || 'N/A'}
          </h3>
          <p className="text-sm text-gray-600">
            {order.createdAt ? `Placed on ${new Date(order.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}` : 'Date not available'}
          </p>
        </div>
        {getStatusBadge(orderStatus)}
      </div>

      {/* Order Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Delivery Address */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            Delivery Address
          </h4>
          <div className="text-sm text-gray-700 space-y-1">
            <p className="font-medium">{customerDetails.fullName || 'N/A'}</p>
            <p>{customerDetails.phone}</p>
            <p>{customerDetails.addressLine1}</p>
            {customerDetails.addressLine2 && <p>{customerDetails.addressLine2}</p>}
            <p>{customerDetails.city}, {customerDetails.state} {customerDetails.zipCode}</p>
            <p>{customerDetails.country}</p>
          </div>
        </div>

        {/* Payment Information */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
            </svg>
            Payment Information
          </h4>
          <div className="text-sm text-gray-700 space-y-1">
            <p><span className="font-medium">Method:</span> Razorpay</p>
            {razorpay.paymentId && (
              <p><span className="font-medium">Payment ID:</span> {razorpay.paymentId}</p>
            )}
            {razorpay.orderId && (
              <p><span className="font-medium">Order ID:</span> {razorpay.orderId}</p>
            )}
            <p><span className="font-medium">Status:</span> 
              <span className="ml-1 text-green-600 font-medium">Paid</span>
            </p>
          </div>
        </div>
      </div>

        {/* Order Items */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
            </svg>
            Order Items
          </h4>
          {items.length > 0 ? (
            <div className="space-y-3">
              {items.map((item, index) => {
                const product = item.productId || {};
                return (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center flex-1">
                      <div className="w-16 h-16 bg-white rounded-lg mr-4 overflow-hidden shadow-sm">
                        <img 
                          src={
                            Array.isArray(product.image) 
                              ? (product.image[0] || fallbackImage)
                              : (product.image || fallbackImage)
                          }
                          alt={product.name || 'Product'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = fallbackImage;
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <h5 className="text-sm font-semibold text-gray-900 mb-1">
                          {product.name || 'Unnamed Product'}
                        </h5>
                        <p className="text-xs text-gray-600">
                          Quantity: {item.quantity || 1} × ₹{formatPrice(item.amount / (item.quantity || 1))}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">₹{formatPrice(item.amount)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p className="text-sm text-gray-500">No items in this order</p>
            </div>
          )}
        </div>

        {/* Invoice and Total */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <button 
                onClick={onDownloadInvoice}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                <FaFileInvoice className="w-4 h-4 mr-2" />
                Download Invoice
              </button>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 mb-1">Total Amount</div>
              <div className="text-2xl font-bold text-gray-900">₹{formatPrice(total)}</div>
            </div>
          </div>
        </div>

        {/* Modal Component */}
        <InvoiceModal
          order={order}
          isOpen={isModalOpen}
          isGenerating={isGenerating}
          onClose={() => setIsModalOpen(false)}
          onDownload={downloadNow}
        />
    </div>
  );
};

const fallbackImage = 'https://images.unsplash.com/photo-1611236263918-d084bbbe9b65?q=80&w=1740&auto=format&fit=crop';

export default OrderDetails;

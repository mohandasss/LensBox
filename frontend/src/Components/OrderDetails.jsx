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

  const orderStatus = order.status || 'Ordered';
  const statusClass = {
    Delivered: 'bg-green-100 text-green-800',
    Shipped: 'bg-blue-100 text-blue-800',
    Ordered: 'bg-yellow-100 text-yellow-800',
  }[orderStatus] || 'bg-yellow-100 text-yellow-800';

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
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200 hover:shadow-md transition-all duration-200">
      {/* Order Info */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Order #{order._id || 'N/A'}</h3>
          <p className="text-sm text-gray-600">
            {order.createdAt ? `Placed on ${new Date(order.createdAt).toLocaleString()}` : 'Date not available'}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusClass}`}>
          {orderStatus}
        </span>
      </div>

      {/* Delivery and Payment */}
      <div className="border-t border-gray-100 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">Delivery Address</h4>
            <p className="text-sm text-gray-600">
              {customerDetails.fullName || 'N/A'}, {customerDetails.phone}<br />
              {customerDetails.addressLine1}, {customerDetails.addressLine2},<br />
              {customerDetails.city}, {customerDetails.pincode}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-1">Payment Method</h4>
            <p className="text-sm text-gray-600">
              {razorpay.paymentId ? `Paid via Razorpay - ${razorpay.paymentId}` : 'Not specified'}
            </p>
          </div>
        </div>

        {/* Order Summary */}
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-800 mb-2">Order Summary</h4>
          {items.length > 0 ? (
            items.map((item, index) => {
              const product = item.productId || {};
              return (
                <div key={index} className="flex justify-between py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 px-2 -mx-2 rounded">
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-md mr-3 overflow-hidden">
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
                    <div>
                      <p className="text-sm font-medium text-gray-900">{product.name || 'Unnamed Product'}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity || 1}</p>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-900">₹{formatPrice(item.amount)}</p>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-gray-500 py-2">No items in this order</p>
          )}
        </div>

        {/* Invoice and Total */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex justify-between items-center text-base font-medium text-gray-900 mt-2 pt-2">
            <div className="flex items-center space-x-2">
              <FaFileInvoice className="text-gray-500" />
              <button 
                onClick={onDownloadInvoice}
                className="flex items-center text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                <FaDownload className="mr-1" />
                Generate Invoice
              </button>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Total Amount</div>
              <div className="text-blue-600">₹{formatPrice(total)}</div>
            </div>
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

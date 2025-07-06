import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentSuccess = ({ orderDetails, onClose }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
      navigate('/orders');
    }, 2500); // 2.5 seconds
    return () => clearTimeout(timer);
  }, [onClose, navigate]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center max-w-sm w-full">
        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
          <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" fill="none" />
            <path d="M8 12.5l3 3 5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-green-700 mb-2">Payment Successful</h2>
        <p className="text-gray-600 mb-4 text-center">Your order <span className="font-semibold">{orderDetails?.orderId?.slice(-6)}</span> has been placed successfully!</p>
        <div className="text-sm text-gray-400">Redirecting to your orders...</div>
      </div>
    </div>
  );
};

export default PaymentSuccess;

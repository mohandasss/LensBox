import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useNavigate, useLocation } from 'react-router-dom';

const PaymentSuccess = ({ orderDetails, onClose, timer = 5, autoClose = true }) => {
  const [countdown, setCountdown] = useState(timer);
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const handleClose = useCallback(() => {
    setIsVisible(false);
    if (onClose) onClose();
    // Only navigate if we're not already on the orders page
    if (!location.pathname.includes('/orders')) {
      navigate('/orders');
    }
  }, [navigate, onClose, location.pathname]);

  useEffect(() => {
    if (!autoClose) return;
    
    const timerId = setTimeout(() => {
      handleClose();
    }, timer * 1000);

    return () => clearTimeout(timerId);
  }, [autoClose, timer, handleClose]);

  // Update countdown every second for display
  useEffect(() => {
    if (!autoClose) return;
    
    const interval = setInterval(() => {
      setCountdown(prev => Math.max(0, prev - 0.1));
    }, 100);
    
    return () => clearInterval(interval);
  }, [autoClose]);

  // Flying money animation elements
  const flyingMoney = Array(15).fill(0).map((_, i) => ({
    id: i,
    x: Math.random() * 400 - 200,
    y: Math.random() * 400 - 200,
    rotate: Math.random() * 360,
    delay: Math.random() * 0.5,
    duration: 2 + Math.random() * 3
  }));

  // Don't render anything if not visible
  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: -20 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="relative bg-white rounded-2xl p-8 max-w-md w-full mx-4 overflow-hidden shadow-2xl"
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
            aria-label="Close"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
          
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            {flyingMoney.map((money) => (
              <motion.div
                key={money.id}
                initial={{ opacity: 0, y: -100, x: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  y: [money.y - 100, money.y],
                  x: [0, money.x],
                  rotate: money.rotate
                }}
                transition={{
                  duration: money.duration,
                  delay: money.delay,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                className="absolute text-yellow-400 text-2xl"
              >
                💰
              </motion.div>
            ))}
          </div>

          {/* Content */}
          <div className="relative z-10 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ 
                scale: [0, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ 
                duration: 1,
                ease: "easeInOut"
              }}
              className="flex justify-center mb-6"
            >
              <div className="bg-green-100 p-4 rounded-full">
                <CheckCircleIcon className="h-16 w-16 text-green-500" />
              </div>
            </motion.div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">
              Your order has been placed successfully. We've sent a confirmation to your email.
            </p>
              {
                console.log(orderDetails)
              }
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-gray-600 mb-2">Order ID: <span className="font-medium">{orderDetails?.orderId || 'N/A'}</span></p>
              <p className="text-sm text-gray-600">Total Paid: <span className="font-medium">₹{orderDetails?.amount || '0.00'}</span></p>
            </div>

            {autoClose && (
              <p className="text-sm text-gray-500">
                Redirecting to orders in {Math.ceil(countdown)}s...
              </p>
            )}
            
            <p className="mt-6 text-sm text-gray-500">
              Check your email for the order confirmation and invoice.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PaymentSuccess;

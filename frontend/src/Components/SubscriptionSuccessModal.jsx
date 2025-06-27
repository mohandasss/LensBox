import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiX } from 'react-icons/fi';

const SubscriptionSuccessModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const benefits = [
    "🎉 Welcome to the LensBox family!",
    "🔥 Exclusive access to new arrivals and limited editions",
    "💸 15% off your first purchase (check your email)",
    "📸 Early access to photography workshops and events",
    "✨ Member-only deals and flash sales"
  ];

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
          transform: 'translateZ(0)'
        }}
      >
        <motion.div 
          className="bg-gray-900 rounded-2xl max-w-md w-full p-8 relative border border-gray-800 overflow-hidden z-[99999]"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'relative',
            zIndex: 99999,
            transform: 'translateZ(0)'
          }}
        >
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <FiX className="w-6 h-6" />
          </button>
          
          {/* Content */}
          <div className="text-center">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiCheckCircle className="w-12 h-12 text-green-500" />
            </div>
            
            <h2 className="text-3xl font-bold text-white mb-6">Subscription Confirmed!</h2>
            <p className="text-gray-300 mb-8">
              Thank you for subscribing to LensBox. Here's what you can look forward to:
            </p>
            
            <ul className="space-y-4 text-left mb-8">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-400 mr-3 mt-1">•</span>
                  <span className="text-gray-200">{benefit}</span>
                </li>
              ))}
            </ul>
            
            <button
              onClick={onClose}
              className="w-full bg-white text-gray-900 font-medium py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Start Exploring
            </button>
            
            <p className="text-xs text-gray-500 mt-4">
              You can unsubscribe at any time. Check your email for the welcome message.
            </p>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SubscriptionSuccessModal;

import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  AlertTriangle, 
  Info,
  X,
  ShoppingCart,
  Heart,
  Star,
  CreditCard,
  User,
  Truck
} from 'lucide-react';

// Notification context
const NotificationContext = createContext();

// Custom hook to use notifications
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

// Notification types and their configurations
const notificationTypes = {
  success: {
    icon: CheckCircle,
    color: 'rgb(34, 197, 94)', // emerald-500
  },
  error: {
    icon: AlertTriangle,
    color: 'rgb(239, 68, 68)', // red-500
  },
  warning: {
    icon: AlertTriangle,
    color: 'rgb(245, 158, 11)', // amber-500
  },
  info: {
    icon: Info,
    color: 'rgb(59, 130, 246)', // blue-500
  },
  cart: {
    icon: ShoppingCart,
    color: 'rgb(147, 51, 234)', // purple-500
  },
  wishlist: {
    icon: Heart,
    color: 'rgb(236, 72, 153)', // pink-500
  },
  review: {
    icon: Star,
    color: 'rgb(245, 158, 11)', // amber-500
  },
  payment: {
    icon: CreditCard,
    color: 'rgb(16, 185, 129)', // emerald-500
  },
  profile: {
    icon: User,
    color: 'rgb(99, 102, 241)', // indigo-500
  },
  shipping: {
    icon: Truck,
    color: 'rgb(6, 182, 212)', // cyan-500
  }
};

// Individual notification component
const NotificationItem = ({ notification, onRemove, index }) => {
  const { type, title, message, duration = 4000, id } = notification;
  const config = notificationTypes[type] || notificationTypes.info;
  const Icon = config.icon;

  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onRemove(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, id, onRemove]);

  return (
    <motion.div
      layout
      initial={{ 
        opacity: 0, 
        y: -60,
        scale: 0.9,
        rotateX: -20,
      }}
      animate={{ 
        opacity: 1, 
        y: 0,
        scale: 1,
        rotateX: 0,
      }}
      exit={{ 
        opacity: 0, 
        y: -60,
        scale: 0.85,
        rotateX: -15,
        transition: {
          duration: 0.2,
          ease: [0.4, 0, 1, 1]
        }
      }}
      transition={{ 
        type: "spring", 
        stiffness: 400, 
        damping: 25,
        mass: 0.8,
        duration: 0.4,
        delay: index * 0.05
      }}
      whileHover={{
        scale: 1.02,
        y: -2,
        transition: { duration: 0.2, ease: "easeOut" }
      }}
      whileTap={{ scale: 0.98 }}
      className="relative w-full max-w-sm bg-notification border border-notification backdrop-blur-notification rounded-2xl shadow-notification overflow-hidden group"
      style={{
        background: 'rgba(var(--notification-bg))',
        borderColor: 'rgba(var(--notification-border))',
      }}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      
      {/* Content */}
      <div className="relative p-4">
        <div className="flex items-start gap-3">
          <div 
            className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5"
            style={{ backgroundColor: config.color + '20' }}
          >
            <Icon 
              size={14} 
              style={{ color: config.color }}
              strokeWidth={2.5}
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground leading-tight">
              {title}
            </p>
            {message && (
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {message}
              </p>
            )}
          </div>
          
          <button
            onClick={() => onRemove(id)}
            className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-muted/50"
          >
            <X size={12} className="text-muted-foreground" />
          </button>
        </div>
      </div>
      
      {/* Progress indicator */}
      {duration > 0 && (
        <motion.div
          className="absolute bottom-0 left-0 h-0.5 rounded-b-2xl"
          style={{ backgroundColor: config.color }}
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ 
            duration: duration / 1000, 
            ease: "linear"
          }}
        />
      )}
      
      {/* Subtle inner shadow */}
      <div className="absolute inset-0 rounded-2xl shadow-inner pointer-events-none opacity-30" />
    </motion.div>
  );
};

// Notification container
const NotificationContainer = ({ notifications, onRemove }) => {
  return (
    <div className="fixed top-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)]">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification, index) => (
          <motion.div
            key={notification.id}
            layout
            className="mb-3 last:mb-0"
          >
            <NotificationItem
              notification={notification}
              onRemove={onRemove}
              index={index}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// Notification provider component
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      type: 'info',
      title: '',
      message: '',
      duration: 3000,
      ...notification
    };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // Limit notifications to prevent overflow
    if (notifications.length >= 5) {
      setNotifications(prev => prev.slice(1));
    }
  }, [notifications.length]);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Convenience methods for common notifications
  const showSuccess = useCallback((title, message = '', duration = 3000) => {
    addNotification({ type: 'success', title, message, duration });
  }, [addNotification]);

  const showError = useCallback((title, message = '', duration = 4000) => {
    addNotification({ type: 'error', title, message, duration });
  }, [addNotification]);

  const showWarning = useCallback((title, message = '', duration = 4000) => {
    addNotification({ type: 'warning', title, message, duration });
  }, [addNotification]);

  const showInfo = useCallback((title, message = '', duration = 3000) => {
    addNotification({ type: 'info', title, message, duration });
  }, [addNotification]);

  const showCartNotification = useCallback((title, message = '', duration = 3000) => {
    addNotification({ type: 'cart', title, message, duration });
  }, [addNotification]);

  const showWishlistNotification = useCallback((title, message = '', duration = 3000) => {
    addNotification({ type: 'wishlist', title, message, duration });
  }, [addNotification]);

  const showReviewNotification = useCallback((title, message = '', duration = 3000) => {
    addNotification({ type: 'review', title, message, duration });
  }, [addNotification]);

  const showPaymentNotification = useCallback((title, message = '', duration = 4000) => {
    addNotification({ type: 'payment', title, message, duration });
  }, [addNotification]);

  const showProfileNotification = useCallback((title, message = '', duration = 3000) => {
    addNotification({ type: 'profile', title, message, duration });
  }, [addNotification]);

  const showShippingNotification = useCallback((title, message = '', duration = 3000) => {
    addNotification({ type: 'shipping', title, message, duration });
  }, [addNotification]);

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showCartNotification,
    showWishlistNotification,
    showReviewNotification,
    showPaymentNotification,
    showProfileNotification,
    showShippingNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer 
        notifications={notifications} 
        onRemove={removeNotification} 
      />
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
import { useEffect } from 'react';

const Notification = ({
  message,
  type = 'success',
  onClose,
  duration = 3000,
  showConfirm = false,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm = () => {}
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const getBgColor = () => {
    switch (type) {
      case 'error':
        return 'bg-red-100 border-red-400 text-red-700';
      case 'warning':
        return 'bg-yellow-100 border-yellow-400 text-yellow-700';
      case 'info':
        return 'bg-blue-100 border-blue-400 text-blue-700';
      case 'success':
      default:
        return 'bg-green-100 border-green-400 text-green-700';
    }
  };

  // Don't auto-close if it's a confirm dialog
  useEffect(() => {
    if (!showConfirm) {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [onClose, duration, showConfirm]);

  const handleConfirm = async () => {
    try {
      await onConfirm();
      onClose?.();
    } catch (error) {
      console.error('Error in confirmation handler:', error);
    }
  };

  return (
    <div className={`fixed top-4 right-4 z-50 px-6 py-4 border-l-4 rounded shadow-lg ${getBgColor()}`}>
      <div className="flex flex-col">
        <div className="flex items-start">
          <div className="py-1">
            <svg
              className={`w-6 h-6 mr-4 ${type === 'error' ? 'text-red-500' : type === 'warning' ? 'text-yellow-500' : type === 'info' ? 'text-blue-500' : 'text-green-500'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {type === 'success' && (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              )}
              {type === 'error' && (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              )}
              {type === 'warning' && (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              )}
              {type === 'info' && (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              )}
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        
        {showConfirm && (
          <div className="flex justify-end space-x-3 mt-3 pt-2 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              className={`px-3 py-1 text-sm font-medium text-white rounded-md transition-colors ${
                type === 'error' ? 'bg-red-500 hover:bg-red-600' :
                type === 'warning' ? 'bg-yellow-500 hover:bg-yellow-600' :
                type === 'info' ? 'bg-blue-500 hover:bg-blue-600' :
                'bg-green-500 hover:bg-green-600'
              }`}
            >
              {confirmText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notification;

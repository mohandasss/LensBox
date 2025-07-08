import React, { useState } from 'react';
import { FaDownload, FaFilePdf } from 'react-icons/fa';
import { downloadInvoice } from '../APIs/OrderAPI';

const InvoiceModal = ({ isOpen, onClose, order }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleDownload = async () => {
    try {
      setIsGenerating(true);
      await downloadInvoice(order._id);
      console.log('Invoice downloaded successfully');
      // Optionally close modal after successful download
      // onClose();
    } catch (error) {
      console.error('Failed to download invoice:', error);
      alert('Failed to download invoice. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white w-full max-w-md mx-auto rounded-lg shadow-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 text-xl"
        >
          &times;
        </button>

        <div className="flex flex-col items-center text-center">
          <FaFilePdf className="text-5xl text-red-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Invoice Generation</h3>

          {isGenerating ? (
            <>
              <p className="text-sm text-gray-600 mb-4 font-medium">Generating invoice PDF...</p>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-4 font-medium">
                Ready to generate invoice for Order #{order._id?.slice(-6) || 'N/A'}
              </p>
              <button
                onClick={handleDownload}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded flex items-center space-x-2 transition-colors"
              >
                <FaDownload />
                <span>Download Invoice</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;

// Alternative: If you want to use the onDownload prop pattern
const InvoiceModalWithProp = ({ isOpen, onClose, onDownload, isGenerating, order }) => {
  if (!isOpen) return null;

  const handleDownloadClick = async () => {
    try {
      if (onDownload) {
        await onDownload(order._id);
      } else {
        await downloadInvoice(order._id);
      }
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download invoice. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white w-full max-w-md mx-auto rounded-lg shadow-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 text-xl"
        >
          &times;
        </button>

        <div className="flex flex-col items-center text-center">
          <FaFilePdf className="text-5xl text-red-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Invoice Generation</h3>

          {isGenerating ? (
            <>
              <p className="text-sm text-gray-600 mb-4 font-medium">Generating invoice PDF...</p>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-4 font-medium">Invoice is ready to download.</p>
              <button
                onClick={handleDownloadClick}
                disabled={isGenerating}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded flex items-center space-x-2 transition-colors"
              >
                <FaDownload />
                <span>Download Invoice</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
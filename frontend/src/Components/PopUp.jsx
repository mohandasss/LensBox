import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaTimes } from "react-icons/fa";
import "./PopUp.css";

const PopUp = ({ message, onClose, duration = 3000, showButton = false }) => {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(false);
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleNavigate = () => {
    navigate('/');
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999]">
      <div className="fixed inset-0 bg-black opacity-50"></div>
      <div className="relative z-[10000] bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div className="flex flex-col items-center gap-4">
          <p className="text-gray-600 text-center">{message}</p>
          {showButton && (
            <button 
              onClick={handleNavigate}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Welcome! Click to continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PopUp;

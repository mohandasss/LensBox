import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import "./PopUp.css";
const PopUp = ({ title, message, onClose }) => {
  const [isOpen, setIsOpen] = useState(true);
  

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  return (
    <div>
      {isOpen && (
        <div
          style={{
            position: "fixed",
            top: "40px", // Adjust based on your navbar height
            right: "20px",
            zIndex: 9999,
          }}
          className="popup bg-indigo-800 text-white py-3 px-4 rounded-lg shadow-md flex items-center"
        >
          <span className="font-bold uppercase text-xs bg-indigo-500 py-1 px-2 rounded-full mr-3">
            {title}
          </span>
          <span className="flex-auto text-sm">{message}</span>
        </div>
      )}
    </div>
  );
};

export default PopUp;

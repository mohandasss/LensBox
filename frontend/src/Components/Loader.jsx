import React, { useEffect, useState } from 'react';
import { FaSpinner } from 'react-icons/fa';

const Loader = () => {
  const [show, setShow] = useState(false);

  // Fade in effect when component mounts
  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 10);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-70 flex flex-col justify-center items-center z-50 transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0'}`}>
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <FaSpinner className="text-white text-2xl animate-spin-slow" />
        </div>
      </div>
      <p className="mt-4 text-white text-sm font-medium">Loading...</p>
    </div>
  );
};

export default Loader;
import React, { useState, useEffect } from "react";
import { FaStar } from "react-icons/fa"; // Make sure to install react-icons
import { Link } from "react-router-dom";

const ProductCard = ({ product }) => {
  // Add state for current image index
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Setup slideshow effect when there are multiple images
  useEffect(() => {
    let interval;
    if (Array.isArray(product.image) && product.image.length > 1) {
      interval = setInterval(() => {
        setCurrentImageIndex((prev) =>
          prev === product.image.length - 1 ? 0 : prev + 1
        );
      }, 2000); // Change image every 2 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [product.image]);

  // Get current image source
  const currentImage = Array.isArray(product.image)
    ? product.image[currentImageIndex]
    : product.image;

  return (
    <div className="w-full bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <Link to={`/product/${product._id}`}>
      <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
        {Array.isArray(product.image) ? (
          product.image.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={product.name}
              className="absolute w-full h-full object-cover transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(${(index - currentImageIndex) * 100}%)`,
              }}
            />
          ))
        ) : (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        )}
        {/* Add dots indicator if multiple images */}
        {Array.isArray(product.image) && product.image.length > 1 && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
            {product.image.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full ${
                  index === currentImageIndex ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
          {product.name}
        </h3>
        <div className="text-sm text-gray-600 line-clamp-2 mb-2 ">
          {product.description}
        </div>
        <div className="flex items-center mb-3">
          <span className="text-sm sm:text-base text-gray-600 font-semibold">
            {product.stock} <span className="text-gray-400">left</span>
          </span>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-gray-800">
            <span className="text-xs sm:text-sm">₹</span>
            <span className="text-lg sm:text-xl font-bold">
              {product.price}
            </span>
            <span className="text-xs sm:text-sm text-gray-600">/day</span>
          </div>
          <button className="bg-blue-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-md hover:bg-blue-700 transition-colors">
            Rent Now
          </button>
        </div>
        </div>
        </Link>
    </div>
  );
};

export default ProductCard;

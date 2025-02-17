import React, { useState, useEffect } from "react";
import { FaStar } from "react-icons/fa";
import { Link } from "react-router-dom";
import { getCategoriesById } from "../APIs/CategoryAPI";

const ProductCard = ({ product }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [categoryname, setCategoryname] = useState(null);
  const [badgeColor] = useState(
    ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500']
      [Math.floor(Math.random() * 6)]
  );

  useEffect(() => {
    console.log("Product Images:", product.image);

    let interval;
    if (Array.isArray(product.image) && product.image.length > 1) {
      interval = setInterval(() => {
        setCurrentImageIndex((prev) =>
          prev === product.image.length - 1 ? 0 : prev + 1
        );
      }, 2000);
    }

    // Async function inside useEffect
    const fetchCategory = async () => {
      try {
        const { category } = await getCategoriesById(product.category);
        setCategoryname(category.name);
      } catch (error) {
        console.error("Error fetching category:", error);
      }
    };

    fetchCategory();

    return () => {
      if (interval) clearInterval(interval); // Cleanup interval on unmount
    };
  }, [product.image, product.category]);

  return (
    <div className="w-full bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <Link to={`/product/${product._id}`}>
        <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
          {Array.isArray(product.image) ? (
            <div className="w-full h-full flex transition-all duration-500">
              {product.image.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={product.name}
                  className={`w-full h-full object-cover absolute transition-opacity duration-700 ${
                    index === currentImageIndex ? "opacity-100" : "opacity-0"
                  }`}
                />
              ))}
            </div>
          ) : (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          )}

          {/* Image Indicators */}
          {Array.isArray(product.image) && product.image.length > 1 && (
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
              {product.image.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-2 rounded-full transition-all duration-300 ${
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
          <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full text-white ${badgeColor}`}>
            {categoryname}
          </span>
          <div className="text-sm text-gray-600 line-clamp-2 mb-2">
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

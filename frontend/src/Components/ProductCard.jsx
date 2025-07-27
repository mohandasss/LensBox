import React, { useState, useEffect } from "react";
import {
  FaStar,
  FaShoppingCart,
  FaTag,
  FaBoxOpen,
  FaRupeeSign,
  FaClock,
  FaCheckCircle,
  FaChevronRight,
  FaImages,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { getCategoriesById } from "../APIs/CategoryAPI";

const ProductCard = ({ product }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [categoryName, setCategoryName] = useState(null);
  const [badgeColor] = useState(
    [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
    ][Math.floor(Math.random() * 6)]
  );

  useEffect(() => {
    let interval;
    if (Array.isArray(product.image) && product.image.length > 1) {
      interval = setInterval(() => {
        setCurrentImageIndex((prev) =>
          prev === product.image.length - 1 ? 0 : prev + 1
        );
      }, 2500);
    }
    console.log(product);

    const fetchCategory = async () => {
      try {
        const { category } = await getCategoriesById(product.category);
        setCategoryName(category.name);
      } catch (error) {
        console.error("Error fetching category:", error);
      }
    };
    fetchCategory();

    return () => interval && clearInterval(interval);
  }, [product.image, product.category]);

  return (
    <div className="w-full bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 border border-gray-100 lg:hover:shadow-xl lg:shadow-md">
      <Link to={`/product/${product._id}`} className="flex flex-col h-full">
        <div className="relative h-40 sm:h-48 md:h-56 lg:h-64 overflow-hidden bg-gray-50">
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
          {Array.isArray(product.image) && product.image.length > 1 && (
            <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-1">
              {product.image.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                    index === currentImageIndex ? "bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="p-3 lg:p-4 flex-1 flex flex-col">
          <div className="flex-1">
            <h3 className="text-sm sm:text-base lg:text-lg font-medium lg:font-semibold text-gray-800 mb-1 lg:mb-2 line-clamp-2 leading-tight">
              {product.name}
            </h3>
            
            <div className="flex items-center mt-1 mb-2">
              <div className="flex items-center">
                <div className="flex text-yellow-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 ${star <= Math.round(product.averageRating || 0) ? 'fill-current' : 'fill-gray-300'}`}
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="ml-1 text-xs sm:text-sm lg:text-sm text-gray-700">
                  {product.averageRating ? product.averageRating.toFixed(1) : 'N/A'}
                </span>
              </div>
              <span className="mx-1 h-1 w-1 rounded-full bg-gray-300"></span>
              <span className="text-xs sm:text-sm lg:text-sm text-gray-500">
                {product.reviewCount || 0} {window.innerWidth >= 1024 ? (product.reviewCount === 1 ? 'review' : 'reviews') : ''}
              </span>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <div className="text-gray-800">
                <div className="flex items-center gap-1">
                  <FaRupeeSign className="text-green-600 lg:text-base" />
                  <span className="text-sm sm:text-base lg:text-lg font-semibold">{product.price}</span>
                  <span className="text-xs text-gray-500">/day</span>
                </div>
                <div className="flex items-center text-xs text-gray-500 mt-0.5 lg:mt-1">
                  <FaBoxOpen className="mr-1" />
                  {product.stock} left
                </div>
              </div>
              <button className="flex items-center justify-center bg-blue-600 text-white p-1.5 sm:p-2 lg:px-4 lg:py-2 rounded-md hover:bg-blue-700 transition-colors text-xs sm:text-sm whitespace-nowrap">
                <FaShoppingCart className="mr-1" />
                <span className="hidden sm:inline">Rent Now</span>
                <FaChevronRight className="ml-0.5 w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;

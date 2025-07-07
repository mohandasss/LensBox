import React, { useEffect, useState, useRef } from "react";
import { getHeroProducts, getMostPopularProducts } from "../APIs/ProductAPI";
import { Link } from "react-router-dom";
import { FaStar } from "react-icons/fa";

const ProductCard = ({ product }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Handle different image formats
  const getImages = () => {
    if (Array.isArray(product.images) && product.images.length > 0) {
      return product.images;
    }
    if (product.image) {
      return [product.image];
    }
    if (
      product.images &&
      !Array.isArray(product.images) &&
      typeof product.images === "string"
    ) {
      return [product.images];
    }
    return ["https://via.placeholder.com/300"];
  };

  const images = getImages();
  const hasMultipleImages = images.length > 1;

  const nextImage = (e) => {
    e?.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e?.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Auto-advance images if there are multiple
  useEffect(() => {
    if (!hasMultipleImages) return;

    const timer = setInterval(() => {
      nextImage();
    }, 3000);

    return () => clearInterval(timer);
  }, [hasMultipleImages, currentImageIndex]);

  return (
    <div className="group relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col w-full">
      {/* Image Container - Fixed Aspect Ratio */}
      <div className="relative pb-[100%] bg-gray-100">
        <div className="absolute inset-0">
          <img
            src={
              Array.isArray(product.image)
                ? product.image[0]
                : product.image || "https://via.placeholder.com/300"
            }
            alt={product.name || "Product"}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://via.placeholder.com/300";
            }}
          />

          {/* Navigation Arrows - Only show if more than one image */}
          {hasMultipleImages && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1.5 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100"
                aria-label="Previous image"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1.5 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100"
                aria-label="Next image"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </>
          )}

          {/* Image Indicator Dots */}
          {hasMultipleImages && (
            <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-1.5">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                    index === currentImageIndex ? "bg-white w-4" : "bg-white/50"
                  }`}
                  aria-label={`View image ${index + 1} of ${images.length}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="p-4 flex-grow flex flex-col min-h-[120px]">
        <h3 className="text-base font-semibold text-gray-900 line-clamp-1 mb-1">{product.name}</h3>
        {/* Rating and review count */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex text-yellow-400">
            {[1,2,3,4,5].map(star => (
              <FaStar key={star} className={star <= Math.round(product.averageRating || 0) ? '' : 'text-gray-300'} />
            ))}
          </div>
          <span className="ml-1 text-xs text-gray-700 font-medium">{product.averageRating ? product.averageRating.toFixed(1) : 'N/A'}</span>
          <span className="mx-1 h-1 w-1 rounded-full bg-gray-300"></span>
          <span className="text-xs text-gray-500">{product.reviewCount || 0} {product.reviewCount === 1 ? 'review' : 'reviews'}</span>
        </div>
        {/* Description */}
        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
          {product.description && product.description.length > 60
            ? `${product.description.substring(0, 60)}...`
            : product.description || 'No description available'}
        </p>
        <div className="mt-auto pt-4 flex items-center gap-2 justify-between">
          <p className="text-sm font-bold text-gray-900">₹{product.price}</p>
        </div>
      </div>
    </div>
  );
};

const HeroProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef(null);
  const cardWidth = 256; // w-64 = 256px
  const cardsToShow = 4; // Number of cards to show at once
  const gap = 32; // gap-x-8 = 2rem = 32px

  const nextSlide = () => {
    setCurrentIndex(prev => Math.min(prev + 1, Math.max(products.length - cardsToShow, 0)));
  };

  const prevSlide = () => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getHeroProducts();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Calculate transform value for smooth sliding
  const transformValue = `translateX(-${currentIndex * (cardWidth + gap)}px)`;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-64 w-full"></div>
              <div className="mt-2 h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="mt-2 h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative max-w-7xl mx-auto px-4 py-12">
      <div className="relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">New arrivals</h2>
          <Link
            to="/products"
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center whitespace-nowrap"
          >
            See all
            <svg
              className="w-4 h-4 ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>

        <div className="relative px-2">
          <div className="overflow-hidden">
            <div 
              ref={containerRef}
              className="flex transition-transform duration-300 ease-in-out pb-4 gap-8"
              style={{ transform: transformValue }}
            >
              {products.map((product) => (
                <div key={product._id} className="flex-none w-64">
                  <Link to={`/product/${product._id}`} className="block">
                    <ProductCard product={product} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons - Close to content box */}
      <button 
        onClick={prevSlide}
        disabled={currentIndex === 0}
        className={`absolute -left-10 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/80 hover:bg-black text-white flex items-center justify-center shadow-lg transition-all duration-200 ${
          currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'opacity-100 hover:scale-110'
        }`}
        aria-label="Previous products"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <button 
        onClick={nextSlide}
        disabled={currentIndex >= products.length - cardsToShow}
        className={`absolute -right-10 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/80 hover:bg-black text-white flex items-center justify-center shadow-lg transition-all duration-200 ${
          currentIndex >= products.length - cardsToShow ? 'opacity-50 cursor-not-allowed' : 'opacity-100 hover:scale-110'
        }`}
        aria-label="Next products"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};

export const MostPopularProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef(null);
  const cardWidth = 256; // w-64 = 256px
  const cardsToShow = 4; // Number of cards to show at once
  const gap = 32; // gap-x-8 = 2rem = 32px

  const nextSlide = () => {
    setCurrentIndex(prev => Math.min(prev + 1, Math.max(products.length - cardsToShow, 0)));
  };

  const prevSlide = () => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getMostPopularProducts();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching most popular products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const transformValue = `translateX(-${currentIndex * (cardWidth + gap)}px)`;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-80 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Most Popular</h2>
        <div className="flex gap-2">
          <button
            onClick={prevSlide}
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 shadow transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={currentIndex === 0}
            aria-label="Previous"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 shadow transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={currentIndex >= Math.max(products.length - cardsToShow, 0)}
            aria-label="Next"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      <div className="relative">
        <div
          className="flex gap-8 transition-transform duration-500"
          style={{ transform: transformValue }}
          ref={containerRef}
        >
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroProducts;

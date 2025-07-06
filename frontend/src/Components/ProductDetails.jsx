import React, { useState, useEffect } from "react";
import { getCategoriesById } from "../APIs/CategoryAPI";
import { addToCart } from "../APIs/CartAPI";
import { addToWishlist } from "../APIs/WishlistAPI";
import { verifyToken } from "../APIs/AuthAPI";
import { useNotification } from "./NotificationSystem";
import SellerInfo from "./SellerInfo";
import { 
  subscribeToStockNotification, 
  unsubscribeFromStockNotification, 
  checkStockNotificationStatus 
} from "../APIs/StockNotificationAPI";
const ProductDetails = ({ product }) => {
  const { showCartNotification, showWishlistNotification, showError, showSuccess, showInfo } = useNotification();
  const [selectedImage, setSelectedImage] = useState(
    Array.isArray(product.image) ? product.image[0] : product.image
  );
  const [quantity, setQuantity] = useState(1);
  const [isSubscribedToStock, setIsSubscribedToStock] = useState(false);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
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

  const addToCarthandler = async (product) => {
    try {
        const {user} =await verifyToken(localStorage.getItem("token"))
        
        
      const addedtocart = await addToCart(product._id, quantity, user._id);
      console.log(addedtocart);
      showCartNotification(
        "Added to Cart!", 
        `${product.name} has been added to your cart.`
      );
    } catch (error) {
      console.error("Failed to add to cart:", error);
      showError(
        "Failed to Add to Cart", 
        "There was an error adding the item to your cart. Please try again."
      );
    }
  };

  const [categoryname, setCategoryname] = useState(null);
  
  // Check if user is subscribed to stock notifications for this product
  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      if (product.stock === 0) {
        setIsCheckingSubscription(true);
        try {
          const token = localStorage.getItem("token");
          if (token) {
            const response = await checkStockNotificationStatus(product._id);
            setIsSubscribedToStock(response.isSubscribed);
          }
        } catch (error) {
          console.error("Error checking subscription status:", error);
        } finally {
          setIsCheckingSubscription(false);
        }
      }
    };

    checkSubscriptionStatus();
  }, [product._id, product.stock]);

  useEffect(
    () => async () => {
      const { category } = await getCategoriesById(product.category);
      setCategoryname(category.name);
    },
    [product]
  );



  const addToWishlistHandler = async (productId) => {
    try {
        const {user} =await verifyToken(localStorage.getItem("token"))
        console.log(productId);
        console.log(user._id);
        const addedtoWishlist = await addToWishlist(productId, user._id);
        showWishlistNotification(
          "Added to Wishlist!", 
          `${product.name} has been added to your wishlist.`
        );
      console.log(addedtoWishlist);
    } catch (error) {
      console.error("Failed to add to wishlist:", error);
      showError(
        "Failed to Add to Wishlist", 
        "There was an error adding the item to your wishlist. Please try again."
      );
    }
  };

  const handleStockNotification = async () => {
    if (!localStorage.getItem("token")) {
      showError("Authentication Required", "Please login to subscribe to stock notifications");
      return;
    }

    setIsSubscribing(true);
    try {
      if (isSubscribedToStock) {
        // Unsubscribe
        await unsubscribeFromStockNotification(product._id);
        setIsSubscribedToStock(false);
        showSuccess(
          "Unsubscribed", 
          "You will no longer receive notifications when this product comes back in stock."
        );
      } else {
        // Subscribe
        await subscribeToStockNotification(product._id);
        setIsSubscribedToStock(true);
        showSuccess(
          "Subscribed to Notifications!", 
          "You will be notified via email when this product comes back in stock."
        );
      }
    } catch (error) {
      console.error("Error handling stock notification:", error);
      const errorMessage = error.response?.data?.message || "Failed to update notification preference";
      showError("Notification Error", errorMessage);
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-wrap -mx-4">
          {/* Product Images - added more shadow and smoother hover effects */}
          <div className="w-full md:w-1/2 px-4 mb-8">
            <div className="aspect-square w-full mb-6 rounded-xl shadow-lg overflow-hidden transition duration-300 hover:shadow-xl">
              <img
                src={selectedImage}
                alt={product.name}
                className="w-full h-full object-cover"
                id="mainImage"
              />
            </div>
            {Array.isArray(product.image) && (
              <div className="flex gap-6 py-4 justify-center overflow-x-auto">
                {product.image.map((img, index) => (
                  <div
                    key={index}
                    className={`aspect-square size-16 sm:size-20 rounded-lg overflow-hidden shadow-md transition duration-300 ${
                      selectedImage === img ? "ring-2 ring-indigo-600" : ""
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} view ${index + 1}`}
                      className="w-full h-full object-cover cursor-pointer opacity-75 hover:opacity-100 transition duration-300"
                      onClick={() => setSelectedImage(img)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Details - improved spacing and typography */}
          <div className="w-full md:w-1/2 px-4">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">
              {product.name}
            </h2>
            <span
              className={`inline-block px-4 py-1.5 text-sm font-semibold rounded-full text-white ${badgeColor} mb-6`}
            >
              {categoryname || "N/A"}
            </span>
            <div className="mb-6">
              <span className="text-3xl font-bold mr-3 text-gray-900">
                ₹{product.price}
              </span>
              {product.originalPrice && (
                <span className="text-lg text-gray-500 line-through">
                  ₹{product.originalPrice}
                </span>
              )}
            </div>

            {/* Rating Stars - improved alignment and spacing */}
            <div className="flex items-center mb-6">
              {[1, 2, 3, 4, 5].map((star) => {
                const starClass = star <= Math.round(product.averageRating || 0) 
                  ? 'text-yellow-400' 
                  : 'text-gray-300';
                return (
                  <svg
                    key={star}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className={`size-5 ${starClass}`}
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
                      clipRule="evenodd"
                    />
                  </svg>
                );
              })}
              <span className="ml-2 text-gray-600 text-sm">
                {product.averageRating ? product.averageRating.toFixed(1) : 'No'} 
                {product.reviewCount ? ` (${product.reviewCount} review${product.reviewCount !== 1 ? 's' : ''})` : ' reviews yet'}
              </span>
            </div>

            <p className="text-gray-700 mb-8 leading-relaxed">
              {product.description}
            </p>

            <div className="mb-8">
              <span
                className={`inline-block px-4 py-1.5 text-sm font-semibold rounded-full ${
                  product.stock === 0
                    ? "bg-red-100 text-red-700 animate-pulse"
                    : product.stock < 10
                    ? "bg-red-100 text-red-700"
                    : product.stock < 20
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {product.stock === 0 ? "Out of Stock" : `${product.stock} units left`}
              </span>
            </div>

            {/* Seller Information */}
            <div className="mt-6 mb-8">
              <p className="text-sm font-medium text-gray-500 mb-2">Sold by</p>
              <SellerInfo productId={product._id} />
            </div>

            {/* Quantity - improved select styling */}
            

            {/* Action Buttons - improved styling and hover effects */}
            <div className="flex space-x-4 mb-8">
              {product.stock === 0 ? (
                // Out of Stock - Show notification button
                <button
                  onClick={handleStockNotification}
                  disabled={isSubscribing || isCheckingSubscription}
                  className={`flex-1 flex gap-2 items-center justify-center px-8 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-300 ${
                    isSubscribedToStock
                      ? "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500"
                      : "bg-orange-600 text-white hover:bg-orange-700 focus:ring-orange-500"
                  } ${(isSubscribing || isCheckingSubscription) ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {isSubscribing ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="size-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
                      />
                    </svg>
                  )}
                  {isSubscribing 
                    ? "Processing..." 
                    : isSubscribedToStock 
                      ? "Unsubscribe from Notifications" 
                      : "Notify When Available"
                  }
                </button>
              ) : (
                // In Stock - Show Add to Cart button
                <button
                  onClick={() => addToCarthandler(product)}
                  className="bg-indigo-600 flex-1 flex gap-2 items-center justify-center text-white px-8 py-3 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-300"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="size-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                    />
                  </svg>
                  Add to Cart
                </button>
              )}
              <button onClick={() => addToWishlistHandler(product._id)} className="bg-gray-100 flex gap-2 items-center justify-center text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="size-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                  />
                </svg>
                Wishlist
              </button>
            </div>

            {/* Key Features - improved list styling */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                Key Features:
              </h3>
              <ul className="list-none space-y-3">
                {product.features
                  .join(", ")
                  .split(",")
                  .map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-700">
                      <svg
                        className="size-5 text-indigo-500 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {feature.trim().replace(/"/g, "")}
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;

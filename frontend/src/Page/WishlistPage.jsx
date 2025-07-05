import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHeart, FiX, FiShoppingBag } from 'react-icons/fi';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import { verifyToken } from '../APIs/AuthAPI';
import { getWishlist, removeFromWishlist } from '../APIs/WishlistAPI';
import { addToCart } from '../APIs/CartAPI';
import { useNotification } from '../Components/NotificationSystem';

const WishlistPage = () => {
  const { showWishlistNotification, showCartNotification, showError, showSuccess } = useNotification();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const fetchWishlist = async () => {
    try {
      const { user } = await verifyToken(localStorage.getItem('token'));
      setUser(user);
      if (user?._id) {
        const wishlistData = await getWishlist(user._id); // Should return product data
        setWishlist(wishlistData);
      } else {
        setError('User not authenticated');
        showError('Authentication Required', 'Please login to view your wishlist');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to load wishlist');
      showError('Failed to Load Wishlist', 'Failed to load wishlist. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemoveFromWishlist = async (productId, e) => {
    e.stopPropagation();
    try {
      const { user } = await verifyToken(localStorage.getItem('token'));
      if (user?._id) {
        await removeFromWishlist(user._id, productId);
        setWishlist((prev) => prev.filter((item) => item._id !== productId));
        showSuccess('Removed from Wishlist', 'The item has been removed from your wishlist.');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      showError('Failed to Remove Item', 'Failed to remove item from wishlist. Please try again.');
    }
  };
  const handleAddToCart = async (productId, e) => {
    e.stopPropagation();
    try {
      if (!user?._id) {
        showError('Authentication Required', 'Please login to add items to cart');
        return;
      }
      
      const quantity = 1;
      setLoading(true);
      const response = await addToCart(productId, quantity, user._id);
      
      if (response.success) {
        showCartNotification('Added to Cart!', 'The item has been added to your cart.');
      } else {
        showError('Failed to Add to Cart', response.message || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      showError('Add to Cart Failed', 'An error occurred while adding to cart. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  const navigateToProduct = (productId) => {
    navigate(`/product/${productId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-red-600 text-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-light text-white mb-2">Your Wishlist</h1>
          <p className="text-white">
            {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'}
          </p>
        </div>

        {/* Wishlist Grid */}
        {wishlist.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {wishlist.map((item) => (
              <div
                key={item._id}
                className="group cursor-pointer"
                onClick={() => navigateToProduct(item._id)}
              >
                {/* Image */}
                <div className="relative aspect-square mb-4 bg-white rounded-lg overflow-hidden">
                  <img
                    src={item.image?.[0] || '/placeholder.svg'}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  {/* Remove Button */}
                  <button
                    onClick={(e) => handleRemoveFromWishlist(item._id, e)}
                    className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white"
                  >
                    <FiX className="w-4 h-4 text-gray-600" />
                  </button>
                </div>

                {/* Info */}
                <div className="space-y-2">
                  <h3 className="text-white font-medium leading-tight group-hover:text-gray-50 transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-lg font-light text-white">
                    ₹{item.price?.toFixed(2) || '0.00'}
                  </p>
                </div>

                {/* Add to Cart Button */}
                <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={(e) => handleAddToCart(item._id, e)}
                    className="w-full bg-white border border-gray-200 text-gray-900 px-4 py-2 rounded hover:bg-gray-50 flex items-center justify-center"
                  >
                    <FiShoppingBag className="w-4 h-4 mr-2 text-white" />
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <FiHeart className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-light text-white mb-2">Your wishlist is empty</h3>
            <p className="text-white mb-8 max-w-sm mx-auto">
              Save items you love to your wishlist and they'll appear here
            </p>
            <button
              onClick={() => navigate('/shop')}
              className="bg-white border border-gray-200 text-gray-900 px-6 py-2 rounded hover:bg-gray-50"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default WishlistPage;

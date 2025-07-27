import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import LoadingSpinner from "../Components/LoadingSpinner";
import CheckoutModal from "../Components/CheckoutModal";
import { verifyToken } from "../APIs/AuthAPI";
import { getCart, updateCartItem, RemoveCartItem } from "../APIs/CartAPI";
import { loadRazorpay } from "../utils/razorpay";
import { clearCart } from "../APIs/CartAPI";
import { useNotification } from "../Components/NotificationSystem";
import config from "../Components/secretfront";

const CartPage = () => {
  const { showCartNotification, showError, showSuccess } = useNotification();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [user, setUser] = useState(null);

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) { 
        console.log("No token found");
        setLoading(false);
        return;
      }

      const { user } = await verifyToken(token);
      setUser(user);
      const response = await getCart(user._id);
      setCartItems(response.cart || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching cart:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // Calculate total price
  const calculateSubtotal = () => {
    if (!cartItems || cartItems.length === 0) return '0.00';
    
    const subtotal = cartItems.reduce(
      (total, item) => total + (parseFloat(item.productId.price) * item.quantity),
      0
    );
    return subtotal.toFixed(2);
  };

  // Handle quantity updates locally
  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setCartItems(prevItems => 
      prevItems.map(item => 
        item._id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // Handle item removal
  const handleRemoveItem = async (productId) => {
    try {
      await RemoveCartItem(user._id, productId);
      showSuccess("Item Removed", "The item has been removed from your cart.");
      fetchCart();
    } catch (error) {
      showError("Failed to Remove Item", "There was an error removing the item from your cart.");
    }
  };

  // Open checkout modal
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      setLoadingProfile(true);
      const { user } = await verifyToken(token);
      setUser(user);
      console.log(user);
    } catch (err) {
      console.error('Error fetching user profile:', err);
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const handleCheckoutClick = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      // Redirect to login or show login modal
      // For now, just open the checkout modal
      setIsCheckoutOpen(true);
      return;
    }
    
    if (!user) {
      await fetchUserProfile();
    }
    
    // Check stock availability before opening checkout
    const insufficientStockItems = cartItems.filter(item => 
      item.quantity > (item.productId.stock || 0)
    );
    
    if (insufficientStockItems.length > 0) {
      alert(`Some items have insufficient stock:\n${
        insufficientStockItems.map(item => 
          `• ${item.productId.name}: Requested ${item.quantity}, Available ${item.productId.stock || 0}`
        ).join('\n')
      }\n\nPlease update your cart quantities.`);
      return;
    }
    
    setIsCheckoutOpen(true);
  };

  // Handle final checkout submission
  const handleCheckoutSubmit = async (checkoutData) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("User not authenticated");
        return;
      }

      const { user } = await verifyToken(token);
      
      // Update all items in the cart with quantities
      await Promise.all(
        cartItems.map(item => 
          updateCartItem(user._id, item._id, item.quantity)
        )
      );

      // Calculate total amount in paise (Razorpay expects amount in smallest currency unit)
      const amount = Math.round(parseFloat(checkoutData.total) * 100);
      
      // Here you would typically create an order on your backend
      // and get the order ID from your server
      const orderData = {
        amount: amount,
        currency: 'INR',
        receipt: `order_${Date.now()}`,
        payment_capture: 1
      };

      console.log('Order data:', orderData);
      console.log('Checkout data:', checkoutData);
      
      // In a real app, you would make an API call to your backend
      // to create a Razorpay order and get the order ID
      // const { orderId } = await createRazorpayOrder(orderData);
      
      // For now, we'll use a mock order ID
      const orderId = 'order_mock_' + Date.now();

      // Load Razorpay script
      const razorpay = await loadRazorpay();
      if (!razorpay) {
        throw new Error('Razorpay SDK failed to load');
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Use env variable
        amount: orderData.amount.toString(),
        currency: orderData.currency,
        name: 'LensBox',
        description: 'Camera Equipment Rental',
        order_id: orderId,
        handler: async function (response) {
          try {
            // Verify payment with your backend
            const token = localStorage.getItem("token");
            const verifyResponse = await fetch('http://localhost:8000/api/checkout/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                amount: amount,
                cartItems: cartItems.map(item => ({
                  productId: item.productId._id,
                  quantity: item.quantity,
                  price: item.productId.price
                }))
              })
            });
            
            const result = await verifyResponse.json();
            
            if (result.success) {
              // Clear the cart and redirect to orders page
              await clearCart(user._id);
              window.location.href = '/orders';
            } else {
              throw new Error(result.message || 'Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            alert('Error verifying payment: ' + error.message);
          }
        },
        modal: {
          ondismiss: function() {
            // This is called when the payment modal is closed without completing payment
            console.log('Payment modal closed');
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone || ''
        },
        theme: {
          color: '#000000'
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
      
      // Close the modal after opening Razorpay
      setIsCheckoutOpen(false);
      
      // Add error handler for payment modal close
      paymentObject.on('payment.failed', function (response) {
        alert('Payment failed: ' + response.error.description);
      });
      
    } catch (err) {
      console.error('Error during checkout:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="flex justify-center items-center h-96">
          <LoadingSpinner />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className={`flex-grow bg-white py-6 sm:py-8 md:py-12 transition-opacity duration-300 ${isCheckoutOpen ? 'opacity-30' : 'opacity-100'}`}>
        <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <h1 className="text-xl sm:text-2xl font-medium text-gray-900 mb-6 sm:mb-8 text-center">
            Your Cart {cartItems.length > 0 && `(${cartItems.length})`}
          </h1>

          {cartItems.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 sm:p-10 md:p-12 text-center border border-gray-200">
              <p className="text-gray-500">Your cart is empty.</p>
              <Link to="/products" className="mt-4 sm:mt-6 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
              <div>
                {cartItems.map((item) => (
                  <div key={item._id} className="p-4 sm:p-6 flex flex-col sm:flex-row border-b border-gray-200">
                    <div className="h-40 w-full sm:h-24 sm:w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 mb-3 sm:mb-0">
                      <Link to={`/product/${item.productId._id}`}>
                        <img
                          src={item.productId.image[0]}
                          alt={item.productId.name}
                          className="h-full w-full object-cover object-center"
                        />
                      </Link>
                    </div>
                    <div className="mt-3 sm:mt-0 sm:ml-4 md:ml-6 flex-1 flex flex-col">
                      <div>
                        <div className="flex flex-col sm:flex-row sm:justify-between">
                          <Link to={`/product/${item.productId._id}`}>
                            <h3 className="text-base font-medium text-gray-900">
                              {item.productId.name}
                            </h3>
                          </Link>
                          <p className="ml-4 text-base font-medium text-gray-900">
                            ₹{item.productId.price.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
                        <div className="flex items-center">
                          <span className="text-sm text-gray-500 mr-2">Qty:</span>
                          <div className="flex items-center">
                            <button 
                              className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-l-md text-gray-600 hover:bg-gray-50 focus:outline-none"
                              onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <span className="sr-only">Decrease quantity</span>
                              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                            <span className="w-10 h-8 flex items-center justify-center border-t border-b border-gray-300 text-gray-700 text-sm">
                              {item.quantity}
                            </span>
                            <button 
                              className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-r-md text-gray-600 hover:bg-gray-50 focus:outline-none"
                              onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                              disabled={item.quantity >= (item.productId.stock || 0)}
                            >
                              <span className="sr-only">Increase quantity</span>
                              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        
                        {/* Stock Status Indicator */}
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            item.quantity > (item.productId.stock || 0)
                              ? 'bg-red-100 text-red-800'
                              : item.productId.stock < 5
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {item.quantity > (item.productId.stock || 0)
                              ? 'Out of Stock'
                              : `${item.productId.stock || 0} available`
                            }
                          </span>
                          {item.quantity > (item.productId.stock || 0) && (
                            <span className="text-xs text-red-600">
                              (Max: {item.productId.stock || 0})
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="mt-3">
                        <button 
                          type="button" 
                          className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-colors"
                          onClick={() => handleRemoveItem(item.productId._id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Cart Summary */}
              <div className="p-4 sm:p-6 bg-gray-50">
                <div className="flex justify-between text-base font-medium text-gray-900">
                  <p>Subtotal</p>
                  <p>₹{calculateSubtotal()}</p>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <p>Shipping</p>
                  <p>Calculated at checkout</p>
                </div>
                <div className="border-t border-gray-200 pt-4 flex justify-between text-base font-medium text-gray-900">
                  <p>Total</p>
                  <p>₹{calculateSubtotal()}</p>
                </div>
                <div className="mt-4 sm:mt-6">
                  <button
                    onClick={handleCheckoutClick}
                    className="w-full bg-black py-2.5 sm:py-3 px-4 rounded-md text-white font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors text-sm sm:text-base"
                    disabled={cartItems.length === 0}
                  >
                    {loading ? 'Processing...' : 'Proceed to Checkout'}
                  </button>
                </div>
                <div className="mt-4 sm:mt-6 flex justify-center text-xs sm:text-sm text-gray-500">
                  <p>
                    or{' '}
                    <Link to="/products" className="font-medium text-indigo-600 hover:text-indigo-500">
                      Continue Shopping
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
      
      {/* Checkout Modal */}
      <CheckoutModal 
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        onCheckout={handleCheckoutSubmit}
        initialValues={user?.address ? {
          fullName: user.name,
          phone: user.phone,
          addressLine1: `${user.address.city}, ${user.address.state}, ${user.address.zip}`,
          addressLine2: "",
          city: user.address.city,
          state: user.address.state,
          zipCode: user.address.zip,
          country: 'India'
        } : {}}
      />
    </div>
  );
};

export default CartPage;
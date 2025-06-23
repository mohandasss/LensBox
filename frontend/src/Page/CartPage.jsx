import React, { useEffect, useState } from "react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import CartItem from "../Components/CartItems";
import { verifyToken } from "../APIs/AuthAPI";
import { getCart, updateCartItem, RemoveCartItem  } from "../APIs/CartAPI";
import {Await, Link} from "react-router-dom";
const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found");
        setLoading(false);
        return;
      }

      const { user } = await verifyToken(token);
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
    return cartItems.reduce(
      (total, item) => total + item.productId.price * item.quantity,
      0
    ).toFixed(2);
  };

  // Handle quantity updates
  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      // Optimistic update
      const updatedItems = cartItems.map(item => 
        item._id === itemId ? { ...item, quantity: newQuantity } : item
      );
      setCartItems(updatedItems);
      
      // API call to update
      await updateCartItem(itemId, { quantity: newQuantity });
    } catch (err) {
      console.error("Error updating quantity:", err);
      // Revert on error
      fetchCart();
    }
  };

  // Handle item removal
  const handleRemoveItem = async (productId) => {
    try {
       const token = localStorage.getItem("token");
        const {user} = await verifyToken(token)
      console.log(productId,user._id);
       const  newres  =  await RemoveCartItem(user._id,productId);
       console.log(newres);
       
      // Optimistic update
      setCartItems(cartItems.filter(item =>item.productId_id  !== productId));
      fetchCart();
      // API call to remove
      
    } catch (err) {
      console.error("Error removing item:", err);
      // Revert on error
      fetchCart();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Navbar />
      <div className="flex-grow bg-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-medium text-gray-900 mb-8 text-center">
            Your Cart {cartItems.length > 0 && `(${cartItems.length})`}
          </h1>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-200">
              <p className="text-gray-500">Your cart is empty.</p>
              <button className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
              <div>
                {cartItems.map((item) => (
                  <CartItem 
                    key={item._id} 
                    item={item} 
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemove={handleRemoveItem}
                  />
                ))}
              </div>
              <div className="border-t border-gray-200 p-6 space-y-4">
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
                <div className="mt-6">
                  <button
                    className="w-full bg-black py-3 px-4 rounded-md text-white font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Checkout
                  </button>
                </div>
                <div className="mt-6 flex justify-center text-sm text-gray-500">
                  <p>
                    or{" "}
                    <Link to={"/products"}>
                    
                    <button type="button" className="font-medium text-indigo-600 hover:text-indigo-500">
                      Continue Shopping
                    </button>
                    </Link>
                    
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CartPage;
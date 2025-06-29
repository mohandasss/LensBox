import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import OrderDetails from "../Components/OrderDetails";
import PaymentSuccess from "../Components/PaymentSuccess";
import { verifyToken } from "../APIs/AuthAPI";
import { getOrders, downloadInvoice } from "../APIs/OrderAPI";
import { toast } from "react-toastify";
// Sample order data - in a real app, this would come from an API

const OrderPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);

  // Check for payment success in URL params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const paymentSuccess = params.get('payment_success');
    const orderId = params.get('order_id');
    const amount = params.get('amount');
   
    

    if (paymentSuccess === 'true' && orderId) {
      setShowPaymentSuccess(true);
      setOrderDetails({
        orderId,
        amount: amount || '0.00'
      });

      // Clean up URL
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, [location]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownloadInvoice = async (orderId) => {
    try {
      setDownloading(true);
      await downloadInvoice(orderId);
      toast.success("Invoice downloaded successfully!");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download invoice. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    const fetchUserAndOrders = async () => {
      try {
        const { user } = await verifyToken(localStorage.getItem("token"));

        if (user?._id) {
          const response = await getOrders(user._id);
          setOrders(response || []);
        } else {
          setError("User not authenticated");
          toast.error("Please login to view your orders");
        }
      } catch (error) {
        console.error("Error:", error);
        setError("Failed to load orders");
        toast.error("Failed to load orders. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndOrders();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-700">
      <Navbar />
      
      {/* Payment Success Popup */}
      {showPaymentSuccess && (
        <PaymentSuccess 
          orderDetails={orderDetails} 
          onClose={() => setShowPaymentSuccess(false)}
          timer={5}
          autoClose={true}
        />
      )}
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Your Orders</h1>
          <p className="text-gray-300">View and track your recent orders</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-gray-700 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="relative">
                <OrderDetails order={order} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-700 rounded-lg shadow-sm border border-gray-600">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1"
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-white">
              No orders yet
            </h3>
            <p className="mt-1 text-sm text-gray-300">
              You haven't placed any orders yet.
            </p>
            <div className="mt-6">
              <a
                href="/products"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Browse Products
              </a>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default OrderPage;

import React, { useEffect, useState } from "react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import OrderDetails from "../Components/OrderDetails";
import { verifyToken } from "../APIs/AuthAPI";
import { getOrders, downloadInvoice } from "../APIs/OrderAPI";
import { toast } from "react-toastify";
// Sample order data - in a real app, this would come from an API
const sampleOrders = [
  {
    id: "ORD-123456",
    date: "June 24, 2025",
    status: "Shipped",
    address: "123 Main St, Apt 4B, New York, NY 10001, United States",
    paymentMethod: "Visa ending in 4242",
    items: [
      {
        id: 1,
        name: "Classic Aviator Sunglasses",
        price: 129.99,
        quantity: 1,
        image:
          "https://images.unsplash.com/photo-1511499767150-a48a237ac008?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80",
      },
      {
        id: 2,
        name: "Polarized Sunglasses",
        price: 89.99,
        quantity: 2,
        image:
          "https://images.unsplash.com/photo-1511499767150-a48a237ac008?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80",
      },
    ],
    subtotal: 309.97,
    shipping: 0.0,
    total: 309.97,
  },
  {
    id: "ORD-123455",
    date: "June 15, 2025",
    status: "Delivered",
    address: "123 Main St, Apt 4B, New York, NY 10001, United States",
    paymentMethod: "Mastercard ending in 5555",
    items: [
      {
        id: 3,
        name: "Blue Light Blocking Glasses",
        price: 49.99,
        quantity: 1,
        image:
          "https://images.unsplash.com/photo-1511499767150-a48a237ac008?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80",
      },
    ],
    subtotal: 49.99,
    shipping: 4.99,
    total: 54.98,
  },
];

const OrderPage = () => {
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
    <div className="min-h-screen bg-gray-800 flex flex-col">
      <Navbar />

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

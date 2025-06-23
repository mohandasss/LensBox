import axios from "axios";

const API_URL = "http://localhost:5000/api/checkout";

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export const createOrder = async (orderData) => {
  try {
    console.log('Creating order with data:', orderData);
    const response = await axiosInstance.post('/create-order', orderData);
    
    console.log('Order created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating order:', {
      error: error.response?.data || error.message,
      status: error.response?.status
    });
    throw error;
  }
};

export const verifyPayment = async (paymentData) => {
  try {
    console.log('Verifying payment:', paymentData);
    const response = await axiosInstance.post('/verify-payment', paymentData);
    console.log('Payment verified:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error verifying payment:', {
      error: error.response?.data || error.message,
      status: error.response?.status
    });
    throw error;
  }
};

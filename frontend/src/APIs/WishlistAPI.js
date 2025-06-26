import axios from "axios";
import {getProduct} from "./ProductAPI";
const API_URL = "http://localhost:5000/api/wishlist";

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${localStorage.getItem("token")}`
  },
  withCredentials: true
});

// Add request interceptor to include the token in every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const getWishlist = async (userId) => {
    try {
      const response = await axiosInstance.get(`/${userId}`);
      console.log('Wishlist API Response:', response.data.products);
      
      // Check if response.data is an array or has a products property
      const wishlistData = Array.isArray(response.data.products) 
        ? response.data.products 
        : (response.data.products || []);
      
      // If we have product IDs, fetch full product details
     
      return wishlistData;
      
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      throw error;
    }
  };

export const addToWishlist = async (productId, userId) => {
  try {
    const response = await axiosInstance.post(`/`, {
      productId,
      userId,
    });
    return response.data;
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    throw error;
  }
};

export const removeFromWishlist = async (userId, productId) => {
  try {
    const response = await axiosInstance.delete(`/${userId}/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    throw error;
  }
};
import axios from "axios";

const API_URL = `${process.env.REACT_APP_BACKEND_BASE_API}api/heatmap`;

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Get heatmap data for admin dashboard (all orders)
 */
export const getAdminHeatmapData = async () => {
  try {
    const response = await axiosInstance.get('/admin');
    if (response.data && response.data.success) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    return [];
  }
};

/**
 * Get heatmap data for seller dashboard (seller's orders only)
 */
export const getSellerHeatmapData = async (sellerId) => {
  try {
    const response = await axiosInstance.get(`/seller/${sellerId}`);
    if (response.data && response.data.success) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    return [];
  }
};

/**
 * Get detailed orders for a specific location
 */
export const getLocationOrders = async (lat, lng) => {
  try {
    const response = await axiosInstance.get('/location-orders', {
      params: { lat, lng }
    });
    if (response.data && response.data.success) {
      console.log('Location orders:', response.data);
      return response.data.data;
    }
    return [];
  } catch (error) {
    console.error('Error fetching location orders:', error);
    return [];
  }
};

export default {
  getAdminHeatmapData,
  getSellerHeatmapData,
  getLocationOrders
}; 
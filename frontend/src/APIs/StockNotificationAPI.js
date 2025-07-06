import axios from "axios";

const API_URL = "http://localhost:5000/api/";

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${localStorage.getItem("token")}`,
  },
});

// Subscribe to stock notification
export const subscribeToStockNotification = async (productId) => {
  try {
    const response = await axiosInstance.post(`/stock-notifications/subscribe/${productId}`);
    return response.data;
  } catch (error) {
    console.error("Error subscribing to stock notification:", error);
    throw error;
  }
};

// Unsubscribe from stock notification
export const unsubscribeFromStockNotification = async (productId) => {
  try {
    const response = await axiosInstance.delete(`/stock-notifications/unsubscribe/${productId}`);
    return response.data;
  } catch (error) {
    console.error("Error unsubscribing from stock notification:", error);
    throw error;
  }
};

// Check notification status
export const checkStockNotificationStatus = async (productId) => {
  try {
    const response = await axiosInstance.get(`/stock-notifications/status/${productId}`);
    return response.data;
  } catch (error) {
    console.error("Error checking stock notification status:", error);
    throw error;
  }
};

// Manually trigger stock notifications (for sellers)
export const triggerStockNotifications = async (productId) => {
  try {
    const response = await axiosInstance.post(`/stock-notifications/trigger/${productId}`);
    return response.data;
  } catch (error) {
    console.error("Error triggering stock notifications:", error);
    throw error;
  }
}; 
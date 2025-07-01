import axios from 'axios';

const API_URL = 'http://localhost:5000/api/admin';
    

// Get dashboard statistics
export const getDashboardStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/dashboard/stats`);
    console.log(response.data.stats);
    return response.data.stats;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

// Get sales by category
export const getSalesByCategory = async () => {
  try {
    const response = await axios.get(`${API_URL}/dashboard/sales-by-category`);
    return response.data.data; // Return the data array directly
  } catch (error) {
    console.error('Error fetching sales by category:', error);
    throw error;
  }
};



export const getSampleSalesData = async () => {
  try {
    const response = await axios.get(`${API_URL}/dashboard/sales-overview`);
    return response.data.data; // Return the data array directly
  } catch (error) {
    console.error('Error fetching sample sales data:', error);
    throw error;
  }
};

export const getRecentOrders = async () => {
  try {
    const response = await axios.get(`${API_URL}/dashboard/recent-orders`);
    return response.data.data; // Return the data array directly
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    throw error;
  }
};

// Add more admin API functions here as needed
export default {
  getDashboardStats,
  getSalesByCategory,
  getSampleSalesData,
  getRecentOrders,
};
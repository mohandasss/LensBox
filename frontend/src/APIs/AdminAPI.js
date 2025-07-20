import axios from 'axios';

const API_URL = `${process.env.REACT_APP_BACKEND_BASE_API}/api/admin`;
    

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


export const getUserStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/dashboard/user-stats`);
    console.log(response.data.data);
    return response.data.data; 
    
  } catch (error) {
    console.error('Error fetching user stats:', error);
    throw error;
  }
};

export const getProductsStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/dashboard/product-stats`);
    console.log(response.data);
    return response.data.data; 
    
  } catch (error) {
    console.error('Error fetching product stats:', error);
    throw error;
  }
};



export const getOrders = async (page = 1) => {
  try {
    const response = await axios.get(`${API_URL}/dashboard/orders`, {
      params: {
        page,
      }
    });
    
    // Log the full response for debugging
    console.log('Orders API Response:', response.data);
    
    // If the response already has data and pagination, return as is
    if (response.data.data && response.data.pagination) {
      return response.data;
    }
    
    // If the response is just an array, create pagination object
    if (Array.isArray(response.data)) {
      return {
        data: response.data,
        pagination: {
          page: 1,
          pages: 1,
          total: response.data.length,
          limit: response.data.length || 15
        }
      };
    }
    
    // Default fallback
    return {
      data: [],
      pagination: {
        page: 1,
        pages: 1,
        total: 0,
        limit: 15
      }
    };
    
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

export const sendBroadcast = async (subject, message) => {
  try {
    const response = await axios.post(`${API_URL}/broadcast`, { subject, message });
    return response.data;
  } catch (error) {
    console.error('Error sending broadcast:', error);
    throw error;
  }
};

// Add more admin API functions here as needed
export default {
  getDashboardStats,
  getSalesByCategory,
  getSampleSalesData,
  getRecentOrders,
  getUserStats,
  getProductsStats,
  getOrders,
  sendBroadcast
};
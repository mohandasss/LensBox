import axios from 'axios';

const API_URL = 'http://localhost:5000/api/seller';
const TEST_API_URL = 'http://localhost:5000/api/test-seller';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function to create auth headers
const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Get seller dashboard statistics
export const getSellerDashboardStats = async () => {
  try {
    console.log('📡 Calling seller dashboard stats API...');
    console.log('🔑 Auth headers:', getAuthHeaders());
    
    // TEMPORARY: Use test endpoint to bypass auth
    const response = await axios.get(`${TEST_API_URL}/test-dashboard/stats`);
    
    console.log('✅ API Response:', response.data);
    return response.data.stats;
  } catch (error) {
    console.error('❌ Error fetching seller dashboard stats:', error.response?.data || error.message);
    console.error('❌ Status:', error.response?.status);
    throw error;
  }
};

// Get seller products
export const getSellerProducts = async (page = 1, limit = 10) => {
  try {
    const response = await axios.get(`${API_URL}/products`, {
      params: { page, limit },
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching seller products:', error);
    throw error;
  }
};

// Get seller orders with pagination
export const getSellerOrders = async (page = 1, limit = 10) => {
  try {
    const response = await axios.get(`${TEST_API_URL}/test-dashboard/orders`, {
      params: { page, limit }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching seller orders:', error);
    throw error;
  }
};

// Get seller reviews with pagination
export const getSellerReviews = async (page = 1, limit = 10) => {
  try {
    const response = await axios.get(`${TEST_API_URL}/test-dashboard/reviews`, {
      params: { page, limit }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching seller reviews:', error);
    throw error;
  }
};

// Get seller analytics
export const getSellerAnalytics = async () => {
  try {
    const response = await axios.get(`${API_URL}/analytics`, {
      headers: getAuthHeaders()
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching seller analytics:', error);
    throw error;
  }
};

// Get revenue chart data
export const getSellerRevenueChart = async () => {
  try {
    // Use real data endpoint
    const response = await axios.get(`${TEST_API_URL}/test-dashboard/revenue-chart`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching revenue chart data:', error);
    throw error;
  }
};

// Get category data
export const getSellerCategoryData = async () => {
  try {
    // Use real data endpoint
    const response = await axios.get(`${TEST_API_URL}/test-dashboard/category-data`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching category data:', error);
    throw error;
  }
};

// Get recent orders
export const getSellerRecentOrders = async (limit = 5) => {
  try {
    // Use real data endpoint
    const response = await axios.get(`${TEST_API_URL}/test-dashboard/recent-orders`, {
      params: { limit }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    throw error;
  }
};

// Get product performance data
export const getSellerProductPerformance = async () => {
  try {
    // Use real data endpoint
    const response = await axios.get(`${TEST_API_URL}/test-dashboard/product-performance`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching product performance:', error);
    throw error;
  }
};

// Update product status
export const updateProductStatus = async (productId, status) => {
  try {
    const response = await axios.put(`${API_URL}/products/${productId}/status`, 
      { status }, 
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating product status:', error);
    throw error;
  }
};

// Update order status
export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await axios.put(`${TEST_API_URL}/test-dashboard/orders/${orderId}/status`, 
      { status }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

// Get seller's average rating and total ratings
export const getSellerRatings = async (sellerId) => {
  try {
    console.log(`Fetching ratings for seller: ${sellerId}`);
    const response = await axios.get(`${API_URL}/${sellerId}/ratings`);
    console.log('Seller ratings response:', response.data);
    
    // Handle different response structures
    const data = response.data.data || response.data;
    
    // Ensure we always return an object with the expected structure
    return {
      averageRating: data.averageRating || data.avgRating || 0,
      totalRatings: data.totalRatings || data.ratingCount || 0,
      ...data // Include any additional data that might be useful
    };
  } catch (error) {
    console.error('Error fetching seller ratings:', error);
    // Return default values instead of throwing to prevent UI breakage
    return {
      averageRating: 0,
      totalRatings: 0,
      error: error.response?.data?.message || 'Failed to load ratings'
    };
  }
};

export default {
  getSellerDashboardStats,
  getSellerProducts,
  getSellerOrders,
  getSellerReviews,
  getSellerAnalytics,
  getSellerRevenueChart,
  getSellerCategoryData,
  getSellerRecentOrders,
  getSellerProductPerformance,
  updateProductStatus,
  updateOrderStatus,
  getSellerRatings
};

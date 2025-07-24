import axios from 'axios';

const API_URL = `${process.env.REACT_APP_BACKEND_BASE_API}/api/seller`;
const TEST_API_URL = `${process.env.REACT_APP_BACKEND_BASE_API}/api/test-seller`;

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
    const response = await axios.get(`${API_URL}/dashboard/stats`, {
      headers: getAuthHeaders()
    });
    console.log('🔑 API URL:', API_URL);
    console.log(response);
    console.log('🔑 Auth headers:', response.data);
    
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
    const response = await axios.get(`${API_URL}/orders`, {
      params: { page, limit },
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching seller orders:', error);
    throw error;
  }
};

// Get seller reviews with pagination
export const getSellerReviews = async (page = 1, limit = 10) => {
  try {
    const response = await axios.get(`${API_URL}/reviews`, {
      params: { page, limit },
      headers: getAuthHeaders()
    });
    return response.data;
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
    const response = await axios.get(`${API_URL}/dashboard/revenue-chart`, {
      headers: getAuthHeaders()
    });
    console.log('🔑 Revenue chart response:', response.data);
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
    const response = await axios.get(`${API_URL}/dashboard/category-data`, {
      headers: getAuthHeaders()
    });
    console.log('🔑 Category data response:', response.data);
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
    const response = await axios.get(`${API_URL}/dashboard/recent-orders`, {
      params: { limit },
      headers: getAuthHeaders()
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
    const response = await axios.get(`${API_URL}/dashboard/product-performance`, {
      headers: getAuthHeaders()
    });
    console.log('Product Performance API response:', response.data);
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
  console.log(orderId,status);
  
  try {
    const response = await axios.put(`${API_URL}/orders/${orderId}/status`, 
      { status },
      { headers: getAuthHeaders() }
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
    const response = await axios.get(`${API_URL}/${sellerId}/ratings`, {
      headers: getAuthHeaders()
    });
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

// Get all seller products with sorting
export const getAllSellerProducts = async (sort = 'salesCount', order = 'desc') => {
  try {
    const response = await axios.get(`${API_URL}/products?sort=${sort}&order=${order}`, {
      headers: getAuthHeaders()
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching all seller products:', error);
    throw error;
  }
};

// Get all products for a given sellerId with pagination and sorting
export const getProductsBySellerId = async (sellerId, { page = 1, limit = 10, sort = 'salesCount', order = 'desc' } = {}) => {
  try {
    const response = await axios.get(`${API_URL}/products/by-id/${sellerId}?page=${page}&limit=${limit}&sort=${sort}&order=${order}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching products by sellerId:', error);
    throw error;
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
  getSellerRatings,
  getAllSellerProducts,
  getProductsBySellerId
};
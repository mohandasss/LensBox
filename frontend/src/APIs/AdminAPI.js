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

// Add more admin API functions here as needed
export default {
  getDashboardStats,
};
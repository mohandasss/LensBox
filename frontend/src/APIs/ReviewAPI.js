import axios from 'axios';
import { verifyToken } from './AuthAPI';
const API_URL = `${process.env.REACT_APP_BACKEND_BASE_API}/api/reviews`;

// Create a new review
export const createReview = async (productId, rating, comment) => {
  try {
    const token = localStorage.getItem('token');
      const {user} =await verifyToken(token);
      const userId =user._id
      console.log(rating, comment, productId, userId);
      
    if (!token) {
      throw new Error('Please log in to submit a review');
    }

    const response = await axios.post(
      API_URL,
      { rating, comment, productId, userId },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log(response.data);

    return response.data;
  } catch (error) {
    console.error('Error creating review:', error);
    throw error.response?.data || error.message;
  }
};

// Get all reviews for a product
export const getProductReviews = async (productId) => {
  try {
    const response = await axios.get(`${API_URL}/${productId}/reviews`);
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching product reviews:', error);
    return [];
  }
};

// Get product rating summary
export const getProductRating = async (productId) => {
  try {
    const response = await axios.get(`${API_URL}/${productId}/rating`);
    return response.data.data || { averageRating: 0, reviewCount: 0 };
  } catch (error) {
    console.error('Error fetching product rating:', error);
    return { averageRating: 0, reviewCount: 0 };
  }
};

export default {
  createReview,
  getProductReviews,
  getProductRating,
};

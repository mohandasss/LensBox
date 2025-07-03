import axios from 'axios';

const API_URL = 'http://localhost:5000/api/reviews';

// Create a new review
export const createReview = async (productId, reviewData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Please log in to submit a review');
    }

    const response = await axios.post(
      API_URL,
      { ...reviewData, productId },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error creating review:', error);
    throw error.response?.data || error.message;
  }
};

// Get all reviews for a product
export const getProductReviews = async (productId) => {
  try {
    const response = await axios.get(`${API_URL}/products/${productId}/reviews`);
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching product reviews:', error);
    return [];
  }
};

// Get product rating summary
export const getProductRating = async (productId) => {
  try {
    const response = await axios.get(`${API_URL}/products/${productId}/rating`);
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

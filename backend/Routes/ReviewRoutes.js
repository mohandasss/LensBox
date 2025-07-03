const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/AuthMiddleware');
const {
  createReview,
  getProductReviews,
  getProductRating
} = require('../Controllers/ReviewController');

// Public routes
router.get('/:productId/reviews', getProductReviews);
router.get('/:productId/rating', getProductRating);

// Protected routes (require authentication)
router.post('/', protect, createReview);

module.exports = router;

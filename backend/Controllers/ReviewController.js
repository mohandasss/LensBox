const Review = require('../Models/Review');
const Product = require('../Models/Products');

// @desc    Create new review
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
  try {
    const { rating, comment, productId } = req.body;
    const userId = req.user._id;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user already reviewed this product
    const alreadyReviewed = await Review.findOne({
      user: userId,
      product: productId
    });

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'Product already reviewed' });
    }

    // Create review
    const review = await Review.create({
      user: userId,
      product: productId,
      rating: Number(rating),
      comment
    });

    res.status(201).json({
      success: true,
      data: review
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get reviews for a product
// @route   GET /api/products/:productId/reviews
// @access  Public
const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name profilePic')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    console.error('Error getting reviews:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get average rating for a product
// @route   GET /api/products/:productId/rating
// @access  Public
const getProductRating = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId)
      .select('averageRating reviewCount');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({
      success: true,
      data: {
        averageRating: product.averageRating || 0,
        reviewCount: product.reviewCount || 0
      }
    });
  } catch (error) {
    console.error('Error getting product rating:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createReview,
  getProductReviews,
  getProductRating
};

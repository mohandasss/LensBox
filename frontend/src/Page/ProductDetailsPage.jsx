import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getProduct } from '../APIs/ProductAPI';
import { getProductReviews, getProductRating } from '../APIs/ReviewAPI';
import { verifyToken } from '../APIs/AuthAPI';
import ProductDetails from '../Components/ProductDetails';
import ReviewList from '../Components/ReviewList';
import ReviewForm from '../Components/ReviewForm';
import Loader from '../Components/Loader';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import { getRelatedProducts } from '../APIs/ProductAPI';
import RelatedProducts from '../Components/RelatedProducts';

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 p-8 relative animate-slideUp">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold transition-colors duration-200"
          onClick={onClose}
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

const ProductDetailsPage = () => {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState({ averageRating: 0, reviewCount: 0 });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [showAllReviews, setShowAllReviews] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await verifyToken(localStorage.getItem('token'));
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log(id);
        const productData = await getProduct(id);
        const reviewsData = await getProductReviews(id);
        const ratingData = await getProductRating(id);
        console.log(productData, reviewsData, ratingData);
        
        setProduct(productData);
        setReviews(reviewsData);
        setRating(ratingData);
        // Fetch related products
        const related = await getRelatedProducts(id);
        setRelatedProducts(related);
      } catch (error) {
        console.error('Error fetching product data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const handleReviewSubmit = async () => {
    try {
      const [reviewsData, ratingData] = await Promise.all([
        getProductReviews(id),
        getProductRating(id)
      ]);
      setReviews(reviewsData);
      setRating(ratingData);
    } catch (error) {
      console.error('Error refreshing reviews:', error);
    }
  };

  if (!product) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar bgBlack={true} />

      <div className="bg-white min-h-screen">
        {loading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader />
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column - Product Details */}
              <div className="lg:col-span-8">
                <ProductDetails product={{ ...product, ...rating }} />
              </div>

              {/* Right Column - Reviews & Related Products */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Customer Reviews - Compact */}
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fadeInUp">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Customer Reviews
                    </h2>
                    {rating.reviewCount > 0 && (
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {rating.reviewCount} review{rating.reviewCount !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <ReviewList reviews={reviews} limit={3} onSeeAll={() => setShowAllReviews(true)} />
                  {!isAuthenticated && (
                    <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                      <p className="text-gray-500 mb-2 text-sm">Sign in to leave a review</p>
                      <a href="/login" className="text-indigo-600 hover:text-indigo-800 font-medium text-sm transition-colors duration-200">Sign In</a>
                    </div>
                  )}
                </section>

                {/* Write a Review - Compact */}
                {isAuthenticated && (
                  <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fadeInUp" style={{animationDelay: '0.1s'}}>
                    <ReviewForm productId={id} onReviewSubmit={handleReviewSubmit} />
                  </section>
                )}

                {/* Related Products - Compact & Visible */}
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fadeInUp" style={{animationDelay: '0.2s'}}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Related Products</h3>
                    <span className="text-sm text-gray-500 bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                      {relatedProducts.length} items
                    </span>
                  </div>
                  <RelatedProducts products={relatedProducts} />
                </section>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <Footer />
      
      {/* Modal for all reviews */}
      <Modal isOpen={showAllReviews} onClose={() => setShowAllReviews(false)}>
        <h2 className="text-2xl font-bold mb-6 text-gray-900">All Reviews</h2>
        <ReviewList reviews={reviews} limit={null} />
      </Modal>
    </div>
  );
};

export default ProductDetailsPage;

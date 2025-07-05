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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-8 relative">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold"
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
    <div className="min-h-screen bg-black">
      <Navbar />

      <div className="flex flex-col bg-white min-h-[30vh] px-4 sm:px-6 lg:px-8 py-8 items-center justify-center">
        {loading ? (
          <Loader />
        ) : (
          <div className="w-full max-w-7xl flex flex-col gap-8">
            {/* Main Product Details */}
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 min-w-0">
                <ProductDetails product={{ ...product, ...rating }} />
              </div>
              {/* Reviews Sidebar */}
              <aside className="w-full md:w-[380px] flex-shrink-0 flex flex-col gap-8">
                {/* Customer Reviews */}
                <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-2">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer Reviews
                    {rating.reviewCount > 0 && (
                      <span className="ml-2 text-gray-400 text-base font-normal">
                        ({rating.reviewCount} review{rating.reviewCount !== 1 ? 's' : ''})
                      </span>
                    )}
                  </h2>
                  <ReviewList reviews={reviews} limit={2} onSeeAll={() => setShowAllReviews(true)} />
                  {!isAuthenticated && (
                    <div className="mt-6 text-center">
                      <p className="text-gray-500 mb-2 text-sm">Sign in to leave a review</p>
                      <a href="/login" className="text-indigo-600 hover:text-indigo-800 font-medium text-sm">Sign In</a>
                    </div>
                  )}
                </section>
                {/* Write a Review */}
                {isAuthenticated && (
                  <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <ReviewForm productId={id} onReviewSubmit={handleReviewSubmit} />
                  </section>
                )}
              </aside>
            </div>
            {/* Related Products - moved below for symmetry */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Products</h3>
              <RelatedProducts products={relatedProducts} />
            </section>
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

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

const ProductDetailsPage = () => {

  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState({ averageRating: 0, reviewCount: 0 });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

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
        const [productData, reviewsData, ratingData] = await Promise.all([
          getProduct(id),
          getProductReviews(id),
          getProductRating(id)
        ]);
        
        setProduct(productData);
        setReviews(reviewsData);
        setRating(ratingData);
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
    <div>
      <div className="min-h-screen bg-black">
        <Navbar />

        <div className="flex flex-col bg-white items-center justify-center min-h-[30vh] px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <Loader />
          ) : (
            <>
              <ProductDetails product={{ ...product, ...rating }} />
              
              {/* Reviews Section */}
              <div className="w-full max-w-4xl mx-auto mt-12 px-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Customer Reviews
                  {rating.reviewCount > 0 && (
                    <span className="ml-2 text-gray-500 text-lg font-normal">
                      ({rating.reviewCount} review{rating.reviewCount !== 1 ? 's' : ''})
                    </span>
                  )}
                </h2>
                
                {/* Review Form (for authenticated users) */}
                {isAuthenticated && (
                  <ReviewForm productId={id} onReviewSubmit={handleReviewSubmit} />
                )}
                
                {/* Reviews List */}
                <ReviewList reviews={reviews} />
                
                {/* Sign in prompt for unauthenticated users */}
                {!isAuthenticated && (
                  <div className="mt-8 text-center">
                    <p className="text-gray-600 mb-4">
                      Sign in to leave a review
                    </p>
                    <a
                      href="/login"
                      className="text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Sign In
                    </a>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        <Footer />
      </div>
     
    </div>
  );
};

export default ProductDetailsPage;

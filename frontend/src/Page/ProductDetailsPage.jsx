import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getProduct } from '../APIs/ProductAPI';
import ProductDetails from '../Components/ProductDetails';
import Loader from '../Components/Loader';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';

const ProductDetailsPage = () => {

  const { id } = useParams();

  const [product, setProduct] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      const { product } = await getProduct(id);
      setProduct(product);
    };
    fetchProduct();
  }, [id]);

  if (!product) {
    return <Loader />;
  }

  return (
    <div>
      <div className="min-h-screen bg-black">
        <Navbar />

        <div className="flex flex-col bg-white items-center justify-center min-h-[30vh] px-4 sm:px-6 lg:px-8">
          <ProductDetails product={product} />
        </div>
        <Footer />
      </div>
     
    </div>
  );
};

export default ProductDetailsPage;

import React from "react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import PreferenceSearch from "../Components/PreferenceSearch";
import ProductCard from "../Components/ProductCard";
import { useState, useEffect } from "react";
import getProducts from "../APIs/ProductAPI";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  useEffect(() => {
    const fetchProducts = async () => {
      const { products } = await getProducts();
      setProducts(products);
    };
    fetchProducts();
  }, []);

  return (
    <div>
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[30vh] px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-6xl mx-auto">
            <PreferenceSearch />
          </div>
        </div>
        <div className="flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pb-12">
          <div className="w-full max-w-6xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-8">Products</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProductsPage;

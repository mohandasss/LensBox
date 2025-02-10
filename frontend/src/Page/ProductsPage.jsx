import React from "react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import PreferenceSearch from "../Components/PreferenceSearch";
import ProductCard from "../Components/ProductCard";
import { useState, useEffect } from "react";
const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    useEffect(() => {

        fetchProducts();
    }, []);
    
    const fetchProducts = async () => {

        const response = await fetch("http://localhost:5000/api/products");
        const data = await response.json();
        console.log(data);
    };
  return (
    <div>
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[30vh] px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-6xl mx-auto">
            <PreferenceSearch />
          </div>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[30vh] px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold text-white">Products</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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

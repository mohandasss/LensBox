import React, { useState, useEffect } from "react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import PreferenceSearch from "../Components/PreferenceSearch";
import ProductCard from "../Components/ProductCard";
import { getProducts, getProductsByCategory } from "../APIs/ProductAPI";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(false); // Added loading state

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { products } = await getProducts();
      setProducts(products);
    } catch (error) {
      console.error("Error fetching all products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductsByCategory = async (category) => {
    try {
      setLoading(true);
      if (category === "all") {
        await fetchProducts();
        return;
      }
      const { products } = await getProductsByCategory(category);
      setProducts(products);
    } catch (error) {
      console.error(`Error fetching products for category ${category}:`, error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(); // Fetch all products initially
  }, []);

  useEffect(() => {
    if (selectedCategory !== "all") {
      fetchProductsByCategory(selectedCategory);
    } else {
      fetchProducts();
    }
  }, [selectedCategory]);

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-[30vh] px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-6xl mx-auto">
          <PreferenceSearch />
        </div>
      </div>
      <div className="flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pb-12">
        <div className="w-full max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              Products
            </h1>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-gray-900 text-white px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer hover:bg-gray-800 transition-all duration-200 shadow-md"
            >
              <option value="all">All Products</option>
              <option value="camera">Camera</option>
              <option value="lens">Lens</option>
              <option value="equipment">Equipment</option>
            </select>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="text-center text-white text-lg">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {products.length > 0 ? (
                products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))
              ) : (
                <div className="text-center text-white col-span-full">
                  No products found.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProductsPage;

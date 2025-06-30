import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import PreferenceSearch from "../Components/PreferenceSearch";
import ProductCard from "../Components/ProductCard";
import { getProducts, getProductsByCategory } from "../APIs/ProductAPI";
import { searchProducts } from "../APIs/ProductAPI";


const ProductsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  // Category options for the dropdown
  const categoryOptions = [
    { value: "all", label: "🌍 All Products" },
    { value: "camera", label: "📷 Camera" },
    { value: "lens", label: "🔍 Lens" },
    { value: "equipment", label: "⚙️ Equipment" }
  ];
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState({
    category: "",
    query: ""
  });




  // Fetch all products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const products = await getProducts();
      setProducts(products || []);
    } catch (error) {
      console.error("Error fetching all products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle search from URL params or props
  const handleSearch = async (categoryName = "", query = "") => {
    try {
      setLoading(true);
      if (query) {
        // If we have a search query, use the search endpoint with category name
        const results = await searchProducts(categoryName, query);
        setProducts(results.data || []);
      } else if (categoryName && categoryName !== "all") {
        // If we have a category name, fetch products for that category
        const response = await getProductsByCategory(categoryName);
        console.log("response",response);
        setProducts(response || []);
      } else {
        // If no search params or 'all' category, fetch all products
        await fetchProducts();
      }
    } catch (error) {
      console.error("Search error:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle category change
  const handleCategoryChange = async (categoryName) => {
    // Update URL with the selected category
    navigate(`/products?category=${categoryName}`, { replace: true });
    
    // Update the selected category
    setSelectedCategory(categoryName);
    
    try {
      setLoading(true);
      if (categoryName === "all") {
        await fetchProducts();
      } else {
        const response = await getProductsByCategory(categoryName);
        setProducts(response || []);
      }
    } catch (error) {
      console.error('Error changing category:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle initial load and URL changes
  useEffect(() => {
    const loadInitialData = async () => {
      const params = new URLSearchParams(location.search);
      const category = params.get('category');
      const query = params.get('q');

      // If we have URL params, use them to set the category and search
      if (category) {
        setSelectedCategory(category);
      }

      if (category && query) {
        // If we have search params in URL, perform search
        await handleSearch(category, query);
      } else if (category && category !== 'all') {
        // If we have a category in URL, fetch products for that category
        const response = await getProductsByCategory(category);
        setProducts(response || []);
      } else {
        // Otherwise, fetch all products
        await fetchProducts();
      }
    };

    loadInitialData();
  }, [location.search]); // Only depend on location.search

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-[30vh] px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-6xl mx-auto">
          <PreferenceSearch 
            onSearch={handleSearch}
            initialCategory={new URLSearchParams(location.search).get('category') || 'camera'}
            initialSearch={new URLSearchParams(location.search).get('q') || ''}
          />
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
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="bg-gray-900 text-white px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer hover:bg-gray-800 transition-all duration-200 shadow-md"
            >
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

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

import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import PreferenceSearch from "../Components/PreferenceSearch";
import ProductCard from "../Components/ProductCard";
import { getProducts, getProductsByCategory } from "../APIs/ProductAPI";
import { searchProducts } from "../APIs/ProductAPI";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getAllCategories } from "../APIs/CategoryAPI";

const ProductsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(false);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [limit] = useState(15); // 15 products per page
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  
  const [categoryOptions, setCategoryOptions] = useState([]);
  
  const [searchParams, setSearchParams] = useState({
    category: "",
    query: ""
  });
  const [debouncedSearch, setDebouncedSearch] = useState({ category: '', query: '' });
  const debounceTimeout = useRef(null);

  // Fetch all products with pagination
  const fetchProducts = async (pageNum = 1) => {
    try {
      setLoading(true);
      const products = await getProducts(pageNum, limit);
      setProducts(products.data || products || []);
      setTotal(products.total || products.length || 0);
      setPages(products.pages || Math.ceil((products.total || products.length || 0) / limit));
    } catch (error) {
      console.error("Error fetching all products:", error);
      setProducts([]);
      setTotal(0);
      setPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Handle search from URL params or props
  const handleSearch = async (categoryName = "", query = "", pageNum = 1) => {
    try {
      setLoading(true);
      if (query) {
        // Always use search endpoint for queries
        const results = await searchProducts(categoryName, query, pageNum, limit);
        setProducts(results.data || results.products || []);
        setTotal(results.total || results.data?.length || 0);
        setPages(results.pages || Math.ceil((results.total || results.data?.length || 0) / limit));
      } else if (categoryName && categoryName !== "all") {
        // If only category is present, fetch by category
        const response = await getProductsByCategory(categoryName, pageNum, limit);
        setProducts(response.products || response.data || []);
        setTotal(response.total || response.products?.length || 0);
        setPages(response.pages || Math.ceil((response.total || response.products?.length || 0) / limit));
      } else {
        // If no search params or 'all' category, fetch all products
        await fetchProducts(pageNum);
      }
    } catch (error) {
      console.error("Search error:", error);
      setProducts([]);
      setTotal(0);
      setPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Handle category change
  const handleCategoryChange = async (categoryName) => {
    // Update URL with the selected category
    navigate(`/products?category=${categoryName}`, { replace: true });
    setSelectedCategory(categoryName);
    setPage(1); // Reset to first page when changing category
    
    try {
      setLoading(true);
      if (categoryName === "all") {
        await fetchProducts(1);
      } else {
        const response = await getProductsByCategory(categoryName, 1, limit);
        setProducts(response.products || response.data || []);
        setTotal(response.total || response.products?.length || 0);
        setPages(response.pages || Math.ceil((response.total || response.products?.length || 0) / limit));
      }
    } catch (error) {
      console.error('Error changing category:', error);
      setProducts([]);
      setTotal(0);
      setPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setPage(newPage);
    if (debouncedSearch.query.length > 0 || debouncedSearch.category.length > 0) {
      handleSearch(debouncedSearch.category, debouncedSearch.query, newPage);
    } else if (selectedCategory !== 'all') {
      handleCategoryChange(selectedCategory);
    } else {
      fetchProducts(newPage);
    }
  };

  // Handle initial load and URL changes
  useEffect(() => {
    const loadInitialData = async () => {
      const params = new URLSearchParams(location.search);
      const category = params.get('category');
      const query = params.get('q');
      const pageParam = params.get('page');
      
      if (pageParam) {
        setPage(parseInt(pageParam));
      }

      // If we have URL params, use them to set the category and search
      if (category) {
        setSelectedCategory(category);
      }

      if (category && query) {
        // If we have search params in URL, perform search
        await handleSearch(category, query, pageParam ? parseInt(pageParam) : 1);
      } else if (category && category !== 'all') {
        // If we have a category in URL, fetch products for that category
        const response = await getProductsByCategory(category, pageParam ? parseInt(pageParam) : 1, limit);
        setProducts(response.products || response.data || []);
        setTotal(response.total || response.products?.length || 0);
        setPages(response.pages || Math.ceil((response.total || response.products?.length || 0) / limit));
      } else {
        // Otherwise, fetch all products
        await fetchProducts(pageParam ? parseInt(pageParam) : 1);
      }
    };

    loadInitialData();
  }, [location.search]); // Only depend on location.search

  // Debounced search effect for preference search
  useEffect(() => {
    if (debouncedSearch.query.length === 0 && debouncedSearch.category.length === 0) return;
    setLoading(true);
    const timeout = setTimeout(() => {
      handleSearch(debouncedSearch.category, debouncedSearch.query, 1);
      setPage(1); // Reset to first page when searching
    }, 500);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line
  }, [debouncedSearch]);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categories = await getAllCategories();
        setCategoryOptions([
          { value: "all", label: "🌍 All Products" },
          ...categories.map(cat => ({ value: cat._id || cat.id, label: cat.name }))
        ]);
      } catch (err) {
        setCategoryOptions([{ value: "all", label: "🌍 All Products" }]);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-[30vh] px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-6xl mx-auto">
          <PreferenceSearch 
            onSearch={(category, query) => {
              setDebouncedSearch({ category, query });
            }}
            initialCategory={new URLSearchParams(location.search).get('category') || 'lens'}
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
            <div className="flex items-center gap-2 ml-4">
              {categoryOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => handleCategoryChange(option.value)}
                  className={`px-4 py-1.5 rounded-full border text-sm font-medium transition-all duration-200 shadow-sm
                    ${selectedCategory === option.value ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'}`}
                  style={{minWidth: 80}}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="text-center text-white text-lg">Loading...</div>
          ) : (
            <>
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
              
              {/* Pagination Controls */}
              {pages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8 animate-fade-in-ios bg-white/10 backdrop-blur-xl rounded-xl shadow-lg p-3 w-fit mx-auto border border-white/20">
                  <button
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white shadow transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  {[...Array(pages)].map((_, i) => (
                    <button
                      key={i}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                        page === i + 1
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                      onClick={() => handlePageChange(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                  
                  <button
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white shadow transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === pages}
                    aria-label="Next page"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
              
              {/* Results Info */}
              {products.length > 0 && (
                <div className="text-center text-gray-400 text-sm mt-4">
                  Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} products
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProductsPage;

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, X, ChevronDown, Camera, Aperture, Zap, Clock } from "lucide-react";
import { searchProducts } from "../APIs/ProductAPI";
import axios from "axios";
import { debounce } from "lodash";

const PreferenceSearch = ({ onSearch, initialCategory = "all", initialSearch = "", className = "", showCategories = true }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);
  const debounceTimeout = useRef(null);

  // Categories with icons
  const categories = [
    { id: "all", label: "All", icon: Search },
    { id: "camera", label: "Cameras", icon: Camera },
    { id: "lens", label: "Lenses", icon: Aperture },
    { id: "accessory", label: "Accessories", icon: Zap },
  ];

  // Fetch search suggestions with debounce
  const fetchSuggestions = useCallback(
    debounce(async (query) => {
      if (!query || query.trim() === '') {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:5000/api/products/suggestions?q=${encodeURIComponent(query)}`,
          {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          }
        );

        if (response.data?.success) {
          setSuggestions(response.data.data || []);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      }
    }, 300), // 300ms debounce
    []
  );

  // Handle search input changes
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.trim() === '') {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    
    // Show loading state
    setShowSuggestions(true);
    
    // Trigger debounced search
    fetchSuggestions(value);
  };

  // Handle search submission
  const handleSubmitSearch = async (e) => {
    if (e) e.preventDefault();
    
    const trimmedTerm = searchTerm.trim();
    if (!trimmedTerm) return;

    // Add to recent searches
    const newRecentSearches = [
      { term: trimmedTerm, category: selectedCategory, timestamp: new Date().toISOString() },
      ...recentSearches.filter(item => item.term.toLowerCase() !== trimmedTerm.toLowerCase())
    ].slice(0, 5);
    
    setRecentSearches(newRecentSearches);
    localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));
    
    // Trigger search
    if (onSearch) {
      onSearch(selectedCategory, trimmedTerm);
    } else {
      navigate(`/products?q=${encodeURIComponent(trimmedTerm)}${selectedCategory !== 'all' ? `&category=${selectedCategory}` : ''}`);
    }
    
    setShowSuggestions(false);
  };

  // Handle suggestion selection
  const handleSelectSuggestion = (suggestion) => {
    setSearchTerm(suggestion.name);
    if (suggestion.category) {
      setSelectedCategory(suggestion.category.toLowerCase());
    }
    setShowSuggestions(false);
    
    // Navigate to product page or trigger search
    if (suggestion.id) {
      navigate(`/product/${suggestion.id}`);
    } else {
      if (onSearch) {
        onSearch(suggestion.category?.toLowerCase() || 'all', suggestion.name);
      }
    }
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load recent searches from localStorage
  useEffect(() => {
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);

  // Update search term when URL changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('q');
    const categoryParam = params.get('category');
    
    if (searchParam) {
      setSearchTerm(searchParam);
    }
    
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [location.search]);

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
    setSuggestions([]);
    setShowSuggestions(false);
    if (onSearch) onSearch('', '');
  };

  return (
    <div className={`w-full max-w-4xl mx-auto relative ${className}`}>
      <div ref={searchRef}>
        <form 
          onSubmit={handleSubmitSearch} 
          className="relative flex items-center bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/60 focus-within:border-gray-300/80 transition-all duration-300 hover:shadow-lg hover:shadow-gray-100/50 group"
        >
          <div className="flex-1 relative flex items-center">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-gray-600 transition-colors duration-200" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => searchTerm.trim() && setShowSuggestions(true)}
                placeholder="Search cameras, lenses, accessories..."
                className="w-full py-4 pl-14 pr-12 text-gray-700 bg-transparent border-0 focus:ring-0 focus:outline-none rounded-2xl placeholder-gray-400 text-[15px] font-light"
                autoComplete="off"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100/60"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Search Button */}
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 transition-all duration-200 whitespace-nowrap shadow-sm hover:shadow-md active:scale-98"
            >
              Search
            </button>
          </div>
        </form>

        {/* Suggestions Dropdown */}
        {showSuggestions && (
          <div className="absolute left-0 top-full w-full z-50 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden">
            {/* Recent Searches */}
            {suggestions.length === 0 && recentSearches.length > 0 && searchTerm.trim() === '' && (
              <div className="p-3 border-b border-gray-100/60">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Recent Searches
                </div>
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      setSearchTerm(search.term);
                      setSelectedCategory(search.category);
                      setShowSuggestions(false);
                      if (onSearch) onSearch(search.category, search.term);
                    }}
                    className="w-full text-left px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50/80 flex items-center rounded-lg mx-1 transition-all duration-200"
                  >
                    <div className="w-8 h-8 bg-gray-100/80 rounded-lg flex items-center justify-center mr-3">
                      <Clock size={14} className="text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <span className="font-medium">{search.term}</span>
                    </div>
                    {search.category !== 'all' && (
                      <span className="text-xs text-gray-500 bg-gray-100/80 px-2 py-1 rounded-full">
                        {categories.find(c => c.id === search.category)?.label}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Search Suggestions */}
            {suggestions.length > 0 && (
              <div className="py-3">
                <div className="px-6 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Products
                </div>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSelectSuggestion(suggestion)}
                    className="w-full text-left px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50/80 flex items-center rounded-lg mx-1 transition-all duration-200"
                  >
                    <div className="w-8 h-8 bg-blue-50/80 rounded-lg flex items-center justify-center mr-3">
                      <Search size={14} className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{suggestion.name}</div>
                      {suggestion.category && (
                        <div className="text-xs text-gray-500 mt-0.5">in {suggestion.category}</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* No Results */}
            {suggestions.length === 0 && searchTerm.trim() !== '' && (
              <div className="px-6 py-4 text-sm text-gray-500 text-center">
                <div className="w-12 h-12 bg-gray-100/80 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Search size={20} className="text-gray-400" />
                </div>
                No results found for "{searchTerm}"
              </div>
            )}

            {/* View All Results */}
            {suggestions.length > 0 && (
              <div className="border-t border-gray-100/60 bg-gradient-to-r from-gray-50/40 to-gray-50/60 px-4 py-3">
                <button
                  type="button"
                  onClick={handleSubmitSearch}
                  className="w-full text-center text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200"
                >
                  View all results for "{searchTerm}" →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PreferenceSearch;
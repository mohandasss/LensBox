import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, X, Clock, Loader2 } from 'lucide-react';
import { debounce } from 'lodash';
import axios from 'axios';

const SearchBar = ({ onSearch, initialSearch = '', className = '' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const searchRef = useRef(null);
  const debounceTimeout = useRef(null);

  // Fetch search suggestions with debounce
  const fetchSuggestions = useCallback(
    debounce(async (query) => {
      // Only fetch if query has at least 2 characters
      if (!query || query.trim().length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      console.log('Fetching suggestions for query:', query);
      
      try {
        const response = await axios.get(
          `http://localhost:5000/api/products/suggestions`,
          {
            params: { q: query },
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            timeout: 3000 // 3 second timeout
          }
        );

        console.log('Suggestions API Response:', {
          status: response.status,
          data: response.data,
          success: response.data?.success,
          count: response.data?.data?.length
        });

        if (response.data?.success) {
          const results = Array.isArray(response.data.data) ? response.data.data : [];
          console.log('Setting search suggestions:', results);
          setSuggestions(results);
          setShowSuggestions(results.length > 0);
        } else {
          console.warn('No valid suggestions data in response:', response.data);
          setSuggestions([]);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            params: error.config?.params
          }
        });
        setSuggestions([]);
      }
    }, 300), // 300ms debounce time
    []
  );

  // Handle search input changes
  const handleSearchChange = (e) => {
    const value = e.target.value;
    console.log('Search input changed:', value);
    setSearchTerm(value);

    // Clear any existing timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // If empty, clear suggestions
    if (value.trim() === '') {
      console.log('Empty search, clearing suggestions');
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Only show loading state if we have enough characters
    if (value.trim().length >= 2) {
      console.log('Search term has enough characters, showing suggestions');
      setShowSuggestions(true);
      fetchSuggestions(value);
    } else {
      console.log('Not enough characters for search');
      setSuggestions([]);
    }
  };

  // Handle search submission
  const handleSubmitSearch = (e) => {
    if (e) e.preventDefault();
    
    const trimmedTerm = searchTerm.trim();
    if (!trimmedTerm) return;

    // Add to recent searches
    const newRecentSearches = [
      { term: trimmedTerm, timestamp: new Date().toISOString() },
      ...recentSearches.filter(item => item.term.toLowerCase() !== trimmedTerm.toLowerCase())
    ].slice(0, 5);
    
    setRecentSearches(newRecentSearches);
    localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));
    
    // Trigger search
    if (onSearch) {
      onSearch(trimmedTerm);
    } else {
      navigate(`/products?q=${encodeURIComponent(trimmedTerm)}`);
    }
    
    setShowSuggestions(false);
  };

  // Handle suggestion selection
  const handleSelectSuggestion = (suggestion) => {
    setSearchTerm(suggestion.name);
    setShowSuggestions(false);
    
    if (suggestion.id) {
      navigate(`/product/${suggestion.id}`);
    } else if (onSearch) {
      onSearch(suggestion.name);
    }
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
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
    
    if (searchParam) {
      setSearchTerm(searchParam);
    }
  }, [location.search]);

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
    setSuggestions([]);
    setShowSuggestions(false);
    if (onSearch) onSearch('', '');
  };

  // Clean up debounce timeout
  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  // Load recent searches from localStorage
  useEffect(() => {
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);

  return (
    <div className={`w-full max-w-4xl mx-auto relative z-10 ${className}`} ref={searchRef}>
      <form 
        onSubmit={handleSubmitSearch} 
        className="relative flex items-center bg-white rounded-full shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent"
      >
        <div className="flex-1 relative flex items-center">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={() => searchTerm.trim() && setShowSuggestions(true)}
            placeholder="Search for cameras, lenses, and more..."
            className="w-full py-4 pl-12 pr-10 text-gray-700 bg-transparent border-0 focus:ring-0 focus:outline-none rounded-full placeholder-gray-400"
            autoComplete="off"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={18} />
            </button>
          )}
          
          <button
            type="submit"
            className="ml-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors whitespace-nowrap"
          >
            Search
          </button>
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
          {/* Recent Searches */}
          {recentSearches.length > 0 && searchTerm.trim() === '' && (
            <div className="py-1">
              <div className="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50 border-b border-gray-100">Recent Searches</div>
              <div className="max-h-60 overflow-y-auto">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      setSearchTerm(search.term);
                      setShowSuggestions(false);
                      if (onSearch) onSearch(search.term);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center border-b border-gray-100 last:border-b-0 transition-colors duration-150"
                  >
                    <Clock size={14} className="mr-3 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{search.term}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Suggestions */}
          {searchTerm.trim() !== '' && (
            <div className="py-1">
              <div className="max-h-60 overflow-y-auto">
                {suggestions.length > 0 ? (
                  suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSelectSuggestion(suggestion)}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center border-b border-gray-100 last:border-b-0 transition-colors duration-150"
                    >
                      <Search size={14} className="mr-3 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{suggestion.name}</span>
                    </button>
                  ))
                ) : searchTerm.trim().length >= 2 ? (
                  <div className="px-4 py-3 text-sm text-gray-500">
                    No results found for "{searchTerm}"
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>
      )}

      {/* View All Results */}
      {suggestions.length > 0 && (
        <div className="border-t border-gray-100 bg-gray-50 px-4 py-2 text-right">
          <button
            type="button"
            onClick={handleSubmitSearch}
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            View all results for "{searchTerm}" →
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchBar;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Camera, Aperture, Compass, Zap } from "lucide-react";
import { searchProducts } from "../APIs/ProductAPI";

const MinimalistSearch = ({ onSearch, initialCategory = "lens", initialSearch = "" }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredModels, setFilteredModels] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

  // Categories with icons
  const categories = [
    { id: "lens", label: "Lens", icon: Aperture },
  ];

  // Equipment data based on categories
  const equipmentData = {
    lens: [
      // Sony Lenses
      "Sony FE 24-70mm f/2.8 GM", "Sony FE 70-200mm f/2.8 GM", "Sony FE 85mm f/1.4 GM",
      "Sony FE 50mm f/1.2 GM", "Sony FE 35mm f/1.4 GM", "Sony FE 16-35mm f/2.8 GM",
      // Canon Lenses
      "Canon RF 24-70mm f/2.8L", "Canon RF 70-200mm f/2.8L", "Canon RF 85mm f/1.2L",
      "Canon RF 50mm f/1.2L", "Canon EF 24-70mm f/2.8L", "Canon EF 70-200mm f/2.8L",
      // Nikon Lenses
      "Nikon Z 24-70mm f/2.8 S", "Nikon Z 70-200mm f/2.8 S", "Nikon Z 85mm f/1.8 S",
      "Nikon Z 50mm f/1.8 S", "Nikon AF-S 24-70mm f/2.8E", "Nikon AF-S 70-200mm f/2.8E",
      // Third Party
      "Sigma 24-70mm f/2.8 DG DN Art", "Sigma 85mm f/1.4 DG DN Art",
      "Tamron 28-75mm f/2.8 Di III RXD", "Tamron 70-180mm f/2.8 Di III VXD"
    ]
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    
    if (value.length > 0) {
      const currentData = equipmentData[selectedCategory] || [];
      const filtered = currentData.filter(item =>
        item.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredModels(filtered.slice(0, 8)); // Limit to 8 suggestions
      setShowSuggestions(true);
    } else {
      setFilteredModels([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectItem = (item) => {
    setSearchTerm(item);
    setShowSuggestions(false);
  };

  const handleCategoryChange = (categoryName) => {
    setSelectedCategory(categoryName);
    setSearchTerm("");
    setShowSuggestions(false);
  };

  const handleSubmitSearch = async (e) => {
    if (e) e.preventDefault();
    
    if (!searchTerm.trim()) {
      // If search term is empty, reset to show all products
      if (onSearch) {
        onSearch('', '');
      }
      return;
    }

    if (onSearch) {
      // Call parent's search handler if provided
      onSearch(selectedCategory, searchTerm);
    } else {
      // Fallback to direct API call if no parent handler
      try {
        const { data } = await searchProducts(selectedCategory, searchTerm);
        setSearchResults(data || []);
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults([]);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmitSearch(e);
    }
  };

  // Update search term when initialSearch prop changes
  useEffect(() => {
    setSearchTerm(initialSearch);
  }, [initialSearch]);

  // Update category when initialCategory prop changes
  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  return (
    <div className="w-full max-w-7xl">
    <form onSubmit={handleSubmitSearch} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      {/* Search Input Row */}
      <div className="flex gap-3 relative">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Search...`}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 focus:bg-white focus:outline-none transition-all placeholder-gray-400"
          />

          {/* Suggestions Dropdown */}
          {showSuggestions && filteredModels.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
              {filteredModels.map((item, index) => (
                <div
                  key={index}
                  className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm border-b border-gray-50 last:border-b-0"
                  onClick={() => handleSelectItem(item)}
                >
                  {item}
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleSubmitSearch}
          className="px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-all"
        >
          Search
        </button>
      </div>
    </form>
  </div>
  );
};

export default MinimalistSearch;
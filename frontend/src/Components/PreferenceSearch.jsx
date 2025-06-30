import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Camera, Aperture, Compass, Zap } from "lucide-react";
import { searchProducts } from "../APIs/ProductAPI";

const MinimalistSearch = ({ onSearch, initialCategory = "507f1f77bcf86cd799439011", initialSearch = "" }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredModels, setFilteredModels] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

  // Categories with icons
  const categories = [
    { id: "507f1f77bcf86cd799439011", label: "Camera", icon: Camera },
    { id: "507f1f77bcf86cd799439012", label: "Lens", icon: Aperture },
    { id: "507f1f77bcf86cd799439015", label: "Drone", icon: Compass },
    { id: "507f1f77bcf86cd799439013", label: "Tripod", icon: Zap },
  ];

  // Equipment data based on categories
  const equipmentData = {
    camera: [
      // Sony Mirrorless
      "Sony A7 III", "Sony A7 IV", "Sony A7R IV", "Sony A7R V", "Sony A7S III",
      "Sony A9 II", "Sony A1", "Sony FX3", "Sony ZV-E1", "Sony ZV-E10",
      "Sony A6400", "Sony A6600",
      // Canon Mirrorless
      "Canon EOS R6 II", "Canon EOS R5", "Canon EOS R3", "Canon EOS R8",
      "Canon EOS R7", "Canon EOS R10", "Canon EOS R50", "Canon EOS M50 Mark II",
      // Canon DSLR
      "Canon EOS 90D", "Canon EOS 5D Mark IV", "Canon EOS 6D Mark II",
      // Nikon Mirrorless
      "Nikon Z9", "Nikon Z8", "Nikon Z7 II", "Nikon Z6 II", "Nikon Z5",
      "Nikon Z50", "Nikon Zfc", "Nikon Z30",
      // Nikon DSLR
      "Nikon D850", "Nikon D780", "Nikon D750", "Nikon D6",
      // Fujifilm
      "Fujifilm X-T5", "Fujifilm X-T4", "Fujifilm X-H2S", "Fujifilm X-S20",
      "Fujifilm X100V", "Fujifilm GFX 100S",
      // Others
      "Panasonic Lumix GH6", "Panasonic Lumix S5 II", "Leica M11", "Leica Q2",
      "OM System OM-1", "Ricoh GR III"
    ],
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
    ],
    drone: [
      "DJI Mavic 3", "DJI Mavic 3 Pro", "DJI Mavic 3 Classic", "DJI Air 3",
      "DJI Mini 4 Pro", "DJI Mini 3", "DJI Mini 3 Pro", "DJI Avata 2",
      "DJI FPV", "DJI Inspire 3", "DJI Matrice 30T", "DJI Phantom 4 Pro",
      "Autel EVO Lite+", "Autel EVO Nano+", "Skydio 2+", "Parrot Anafi",
      "Holy Stone HS720E", "Potensic ATOM SE", "Ruko F11GIM2"
    ],
    tripod: [
      "Manfrotto MT055XPRO3", "Manfrotto BeFree Advanced", "Gitzo GT3543XLS",
      "Peak Design Travel Tripod", "Vanguard Alta Pro 263AP", "Joby GorillaPod 5K",
      "Benro Mach3 TMA47AXL", "Really Right Stuff TVC-24L", "Sirui T-025X",
      "Feisol CT-3372 Rapid", "Oben CT-3535", "MeFOTO RoadTrip",
      "Induro CLT304L", "Benro Rhino FRHN34CVX30", "Gitzo GT1545T Series 1"
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

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
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
      {/* Category Pills */}
      <div className="flex flex-wrap gap-2 mb-3">
        {categories.map((category) => {
          const IconComponent = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.id)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all
                ${selectedCategory === category.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              <IconComponent size={12} />
              {category.label}
            </button>
          );
        })}
      </div>

      {/* Search Input Row */}
      <div className="flex gap-3 relative">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Search ${categories.find(c => c.id === selectedCategory)?.label.toLowerCase()}...`}
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
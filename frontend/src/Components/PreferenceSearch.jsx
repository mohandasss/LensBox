import React, { useState } from "react";
// Add fuse.js for fuzzy search
import Fuse from "fuse.js";
import { searchProducts } from "../APIs/ProductAPI";

const PreferenceSearch = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Add new states for camera model search
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredModels, setFilteredModels] = useState([]);

  // Add new states for location search
  const [locationSearchTerm, setLocationSearchTerm] = useState("");
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState([]);

  // Example camera models array
  const cameraModels = [
    // Sony Mirrorless Cameras
    "Sony A7 III",
    "Sony A7 IV",
    "Sony A7R IV",
    "Sony A7R V",
    "Sony A7S III",
    "Sony A9 II",
    "Sony A1",
    "Sony FX3",
    "Sony ZV-E1",
    "Sony ZV-E10",
    "Sony A6400",
    "Sony A6600",

    // Canon Mirrorless Cameras
    "Canon EOS R6 II",
    "Canon EOS R5",
    "Canon EOS R3",
    "Canon EOS R8",
    "Canon EOS R7",
    "Canon EOS R10",
    "Canon EOS R50",
    "Canon EOS M50 Mark II",
    "Canon EOS R100",

    // Canon DSLR Cameras
    "Canon EOS 90D",
    "Canon EOS 5D Mark IV",
    "Canon EOS 6D Mark II",
    "Canon EOS 1D X Mark III",

    // Nikon Mirrorless Cameras
    "Nikon Z9",
    "Nikon Z8",
    "Nikon Z7 II",
    "Nikon Z6 II",
    "Nikon Z5",
    "Nikon Z50",
    "Nikon Zfc",
    "Nikon Z30",

    // Nikon DSLR Cameras
    "Nikon D850",
    "Nikon D780",
    "Nikon D750",
    "Nikon D6",
    "Nikon D5600",
    "Nikon D3500",

    // Fujifilm Cameras
    "Fujifilm X-T5",
    "Fujifilm X-T4",
    "Fujifilm X-H2S",
    "Fujifilm X-S20",
    "Fujifilm X100V",
    "Fujifilm GFX 100S",
    "Fujifilm GFX 50S II",

    // Panasonic Cameras
    "Panasonic Lumix GH6",
    "Panasonic Lumix S5 II",
    "Panasonic Lumix G9",
    "Panasonic Lumix GH5 II",
    "Panasonic Lumix S1H",

    // Leica Cameras
    "Leica M11",
    "Leica SL2",
    "Leica Q2",
    "Leica CL",
    "Leica M10-R",

    // OM System / Olympus Cameras
    "OM System OM-1",
    "Olympus OM-D E-M1 Mark III",
    "Olympus PEN-F",

    // Hasselblad Cameras
    "Hasselblad X2D 100C",
    "Hasselblad X1D II 50C",

    // Ricoh / Pentax Cameras
    "Ricoh GR III",
    "Pentax K-3 Mark III",
  ];

  // Add Indian cities array
  const indianCities = [
    // Major Metropolitan Cities
    "Mumbai, Maharashtra",
    "Delhi, Delhi",
    "Bangalore, Karnataka",
    "Hyderabad, Telangana",
    "Chennai, Tamil Nadu",
    "Kolkata, West Bengal",
    "Pune, Maharashtra",
    "Ahmedabad, Gujarat",

    // Other Major Cities
    "Jaipur, Rajasthan",
    "Lucknow, Uttar Pradesh",
    "Kanpur, Uttar Pradesh",
    "Nagpur, Maharashtra",
    "Indore, Madhya Pradesh",
    "Thane, Maharashtra",
    "Bhopal, Madhya Pradesh",
    "Visakhapatnam, Andhra Pradesh",
    "Pimpri-Chinchwad, Maharashtra",
    "Patna, Bihar",
    "Vadodara, Gujarat",
    "Ghaziabad, Uttar Pradesh",
    "Ludhiana, Punjab",
    "Agra, Uttar Pradesh",
    "Nashik, Maharashtra",
    "Faridabad, Haryana",
    "Meerut, Uttar Pradesh",
    "Rajkot, Gujarat",
    "Varanasi, Uttar Pradesh",
    "Srinagar, Jammu & Kashmir",
    "Aurangabad, Maharashtra",
    "Dhanbad, Jharkhand",
    "Amritsar, Punjab",
    "Navi Mumbai, Maharashtra",
    "Allahabad, Uttar Pradesh",
    "Ranchi, Jharkhand",
    "Howrah, West Bengal",
    "Coimbatore, Tamil Nadu",
    "Jabalpur, Madhya Pradesh",
    "Gwalior, Madhya Pradesh",
    "Vijayawada, Andhra Pradesh",
    "Jodhpur, Rajasthan",
    "Madurai, Tamil Nadu",
    "Raipur, Chhattisgarh",
    "Kochi, Kerala",
    "Chandigarh, Chandigarh",
    "Mysore, Karnataka",
    "Guwahati, Assam",
    "Thiruvananthapuram, Kerala",
    "Udaipur, Rajasthan",
    "Dehradun, Uttarakhand",
    "Shimla, Himachal Pradesh",
    "Puducherry, Puducherry",
    "Bhubaneswar, Odisha",
    "Mangalore, Karnataka",
  ];

  // Initialize Fuse for fuzzy search
  const fuse = new Fuse(cameraModels, {
    threshold: 0.3,
    minMatchCharLength: 2,
  });

  // Initialize Fuse for location search
  const locationFuse = new Fuse(indianCities, {
    threshold: 0.3,
    minMatchCharLength: 2,
  });

  // Update date selection handler for range selection
  const handleDateSelect = (date) => {
    if (!dateRange.start || dateRange.end) {
      // Start new selection
      setDateRange({ start: date, end: null });
    } else {
      // Complete the range
      if (date < dateRange.start) {
        setDateRange({ start: date, end: dateRange.start });
      } else {
        setDateRange({ start: dateRange.start, end: date });
      }
    }
  };

  // Helper to check if a date is within the selected range
  const isInRange = (date) => {
    if (!dateRange.start || !dateRange.end) return false;
    return date >= dateRange.start && date <= dateRange.end;
  };

  // Helper to check if a date is the start or end of the range
  const isRangeEnd = (date) => {
    return (
      (dateRange.start && date.getTime() === dateRange.start.getTime()) ||
      (dateRange.end && date.getTime() === dateRange.end.getTime())
    );
  };

  // Generate calendar days with range selection styling
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDay = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const prevMonthDays = [];
    for (let i = 0; i < startingDay; i++) {
      const day = new Date(year, month, -i);
      prevMonthDays.unshift(
        <div key={`prev-${day}`} className="text-gray-400 text-center p-2">
          {day.getDate()}
        </div>
      );
    }

    const currentMonthDays = [];
    for (let day = 1; day <= totalDays; day++) {
      const currentDay = new Date(year, month, day);
      const inRange = isInRange(currentDay);
      const isEndpoint = isRangeEnd(currentDay);

      currentMonthDays.push(
        <div
          key={`current-${day}`}
          className={`
            text-center p-2 cursor-pointer
            ${inRange ? "bg-blue-50" : "hover:bg-blue-100"}
            ${isEndpoint ? "bg-blue-500 text-white rounded-full" : ""}
          `}
          onClick={() => handleDateSelect(currentDay)}
        >
          {day}
        </div>
      );
    }

    return [...prevMonthDays, ...currentMonthDays];
  };

  // Month navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  const handleApply = () => {
    setShowDatePicker(false);
    // Format the date range for display
    const formattedRange =
      dateRange.start && dateRange.end
        ? `${dateRange.start.toLocaleDateString()} - ${dateRange.end.toLocaleDateString()}`
        : dateRange.start
        ? dateRange.start.toLocaleDateString()
        : "";
    setDateRange({
      ...dateRange,
      displayValue: formattedRange,
    });
  };

  const handleCancel = () => {
    setShowDatePicker(false);
    setDateRange({ start: null, end: null, displayValue: "" });
  };

  // Handle input change for camera model search
  const handleCameraModelSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.length > 0) {
      const results = fuse.search(value);
      setFilteredModels(results.map((result) => result.item));
      setShowSuggestions(true);
    } else {
      setFilteredModels([]);
      setShowSuggestions(false);
    }
  };

  // Handle suggestion selection
  const handleSelectModel = (model) => {
    setSearchTerm(model);
    setShowSuggestions(false);
  };

  // Handle input change for location search
  const handleLocationSearch = (e) => {
    const value = e.target.value;
    setLocationSearchTerm(value);

    if (value.length > 0) {
      const results = locationFuse.search(value);
      setFilteredLocations(results.map((result) => result.item));
      setShowLocationSuggestions(true);
    } else {
      setFilteredLocations([]);
      setShowLocationSuggestions(false);
    }
  };

  // Handle location suggestion selection
  const handleSelectLocation = (location) => {
    setLocationSearchTerm(location);
    setShowLocationSuggestions(false);
  };

  const handleSearch = async () => {
    // Format the search parameters
    const searchParams = {
      cameraModel: searchTerm || null,
      location: locationSearchTerm || null,
      dateRange: dateRange.start && dateRange.end ? {
        startDate: dateRange.start.toISOString().split('T')[0], // Format: YYYY-MM-DD
        endDate: dateRange.end.toISOString().split('T')[0]
      } : null
    };

    // Log the search parameters (replace with your API call)
    console.log('Search Parameters:', searchParams);
    
    
    try {
      const response = await searchProducts(searchParams);
      console.log('Search Response:', response);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  return (
    <div className="flex flex-col items-center pt-10 w-full px-4">
      <div className="bg-white shadow-lg rounded-lg p-4 sm:p-7 w-full">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Camera Model Input */}
          <div className="flex-1 relative">
            <p className="text-sm py-2 font-bold text-gray-600">Camera Model</p>
            <input
              type="text"
              value={searchTerm}
              onChange={handleCameraModelSearch}
              placeholder="Search camera"
              className="w-full p-2 border rounded-md"
            />
            {/* Suggestions dropdown */}
            {showSuggestions && filteredModels.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                {filteredModels.map((model, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
                    onClick={() => handleSelectModel(model)}
                  >
                    {model}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Updated Location Input */}
          <div className="flex-1 relative">
            <p className="text-sm py-2 font-bold text-gray-600">Location</p>
            <input
              type="text"
              value={locationSearchTerm}
              onChange={handleLocationSearch}
              placeholder="Search location"
              className="w-full p-2 border rounded-md"
            />
            {/* Location suggestions dropdown */}
            {showLocationSuggestions && filteredLocations.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                {filteredLocations.map((location, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
                    onClick={() => handleSelectLocation(location)}
                  >
                    {location}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Date Input */}
          <div className="flex-1 relative">
            <p className="text-sm py-2 font-bold text-gray-600">Date</p>
            <input
              type="text"
              value={dateRange.displayValue || ""}
              onClick={() => setShowDatePicker(true)}
              placeholder="Select date range"
              className="w-full p-2 border rounded-md cursor-pointer"
              readOnly
            />

            {showDatePicker && (
              <div className="absolute right-0 sm:right-auto top-full mt-2 bg-white shadow-lg rounded-lg p-3 sm:p-4 z-10 w-[calc(100vw-2rem)] sm:w-auto min-w-[280px] max-w-[320px]">
                <div className="flex justify-between items-center mb-4">
                  <button
                    className="p-1 hover:bg-gray-100 rounded-full text-lg w-8 h-8 flex items-center justify-center"
                    onClick={handlePrevMonth}
                  >
                    &lt;
                  </button>
                  <span className="text-sm sm:text-base font-medium">
                    {currentDate.toLocaleString("default", { month: "long" })} /{" "}
                    {currentDate.getFullYear()}
                  </span>
                  <button
                    className="p-1 hover:bg-gray-100 rounded-full text-lg w-8 h-8 flex items-center justify-center"
                    onClick={handleNextMonth}
                  >
                    &gt;
                  </button>
                </div>

                {/* Calendar header */}
                <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                    <div
                      key={day}
                      className="text-center text-gray-600 text-xs sm:text-sm"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-1 sm:gap-2">
                  {generateCalendarDays()}
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={handleCancel}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm text-gray-600 hover:bg-gray-100 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApply}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Search Button */}
          <div className="flex items-end mt-9">
            <button
              className="w-full sm:w-auto px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors h-[42px]"
              onClick={handleSearch}
            >
              Search
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreferenceSearch;

import React, { useState } from "react";

const PreferenceSearch = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [showDatePicker, setShowDatePicker] = useState(false);

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
            ${inRange ? 'bg-blue-50' : 'hover:bg-blue-100'}
            ${isEndpoint ? 'bg-blue-500 text-white rounded-full' : ''}
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
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleApply = () => {
    setShowDatePicker(false);
    // Format the date range for display
    const formattedRange = dateRange.start && dateRange.end
      ? `${dateRange.start.toLocaleDateString()} - ${dateRange.end.toLocaleDateString()}`
      : dateRange.start
      ? dateRange.start.toLocaleDateString()
      : '';
    setDateRange({
      ...dateRange,
      displayValue: formattedRange
    });
  };

  const handleCancel = () => {
    setShowDatePicker(false);
    setDateRange({ start: null, end: null, displayValue: '' });
  };

  return (
    <div className="flex flex-col items-center pt-10 w-full px-4">
      <div className="bg-white shadow-lg rounded-lg p-4 sm:p-7 w-full">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Camera Model Input */}
          <div className="flex-1">
            <p className="text-sm py-2 font-bold text-gray-600">Camera Model</p>
            <input
              type="text"
              placeholder="Search camera"
              className="w-full p-2 border rounded-md"
            />
          </div>

          {/* Location Input */}
          <div className="flex-1">
            <p className="text-sm py-2 font-bold text-gray-600">Location</p>
            <input
              type="text"
              placeholder="Search location"
              className="w-full p-2 border rounded-md"
            />
          </div>

          {/* Date Input */}
          <div className="flex-1 relative">
            <p className="text-sm py-2 font-bold text-gray-600">Date</p>
            <input
              type="text"
              value={dateRange.displayValue || ''}
              onClick={() => setShowDatePicker(true)}
              placeholder="Select date range"
              className="w-full p-2 border rounded-md cursor-pointer"
              readOnly
            />
            
            {showDatePicker && (
              <div className="absolute right-0 sm:right-auto top-full mt-2 bg-white shadow-lg rounded-lg p-3 sm:p-4 z-10 w-[calc(100vw-2rem)] sm:w-auto min-w-[280px] max-w-[320px]">
                <div className="flex justify-between items-center mb-4">
                  <button className="p-1 hover:bg-gray-100 rounded-full text-lg w-8 h-8 flex items-center justify-center" onClick={handlePrevMonth}>&lt;</button>
                  <span className="text-sm sm:text-base font-medium">
                    {currentDate.toLocaleString('default', { month: 'long' })} / {currentDate.getFullYear()}
                  </span>
                  <button className="p-1 hover:bg-gray-100 rounded-full text-lg w-8 h-8 flex items-center justify-center" onClick={handleNextMonth}>&gt;</button>
                </div>
                
                {/* Calendar header */}
                <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                    <div key={day} className="text-center text-gray-600 text-xs sm:text-sm">
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
        </div>
      </div>
    </div>
  );
};

export default PreferenceSearch;

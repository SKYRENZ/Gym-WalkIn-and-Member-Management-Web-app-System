import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import '../../css/admin/DatePicker.css';

function DatePicker({ setDate }) {
  // Initialize with today's date in YYYY-MM-DD format
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    // Ensure it's in local timezone
    const formattedDate = today.toLocaleDateString('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).split('/').reverse().join('-');
    return formattedDate;
  });

  // Call setDate with initial date when component mounts
  useEffect(() => {
    setDate(selectedDate);
  }, [selectedDate, setDate]);

  const handleDateChange = (event) => {
    const newDate = event.target.value;
    
    // Update local state
    setSelectedDate(newDate);
    
    // Call the setDate prop with the new date
    setDate(newDate);
  };

  return (
    <div className="datepicker">
      <input 
        type="date" 
        value={selectedDate}
        onChange={handleDateChange}
        className="date-input"
        max={new Date().toISOString().split('T')[0]} // Prevent future dates
      />
    </div>
  );
}

DatePicker.propTypes = {
  setDate: PropTypes.func.isRequired,
};

export default DatePicker;
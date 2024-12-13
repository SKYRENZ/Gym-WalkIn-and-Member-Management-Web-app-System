import  { useState } from 'react';
import PropTypes from 'prop-types';
import '../../css/admin/DatePicker.css';

function DatePicker({ setDate }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const handleDateChange = (event) => {
    const newDate = event.target.value;
    setSelectedDate(newDate);
    setDate(newDate);
  };

  return (
    <div className="datepicker">
      <input 
        type="date" 
        value={selectedDate}
        onChange={handleDateChange}
        className="date-input"
      />
    </div>
  );
}

DatePicker.propTypes = {
  setDate: PropTypes.func.isRequired,
};

export default DatePicker;
import  { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const ExampleDatePicker = () => {
  const [startDate, setStartDate] = useState(null);
  const [isOpen, setIsOpen] = useState(false); // State to manage the open state of the datepicker

  const handleDateChange = (date) => {
    setStartDate(date);
    console.log("Selected date:", date);
    setIsOpen(false); // Close the datepicker after selecting a date
  };

  const handleFocus = () => {
    setIsOpen(true); // Open the datepicker on input focus
  };

  return (
    <div>
      <h2>Select a Date</h2>
      <DatePicker
        selected={startDate}
        onChange={handleDateChange}
        onFocus={handleFocus} // Open datepicker on focus
        shouldCloseOnSelect={true} // Close the datepicker on date selection
        open={isOpen} // Control the open state
        inline // Display the datepicker inline
      />
    </div>
  );
};

export default ExampleDatePicker;
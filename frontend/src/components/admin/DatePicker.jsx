
import PropTypes from 'prop-types'; // Import PropTypes
import '../../css/admin/DatePicker.css';

function DatePicker({ setDate }) {
  const handleDateChange = (event) => {
    setDate(event.target.value); // Update the date in the parent component
  };

  return (
    <div className='datepicker'>
      <input type="date" onChange={handleDateChange} />
    </div>
  );
}

// Define prop types for the component
DatePicker.propTypes = {
  setDate: PropTypes.func.isRequired, // setDate should be a required function
};

export default DatePicker;
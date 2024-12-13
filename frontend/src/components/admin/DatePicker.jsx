import PropTypes from 'prop-types';
import '../../css/admin/DatePicker.css';

function DatePicker({ setDate }) {
  const handleDateChange = (event) => {
    setDate(event.target.value); // Update the date in the parent component
    event.target.blur();
  };

  const handleClick = (event) => {
    event.target.showPicker(); // Show the date picker popup
  };

  return (
    <div className='datepicker'>
      <input type="date" onChange={handleDateChange} onClick={handleClick} />
    </div>
  );
}

// Define prop types for the component
DatePicker.propTypes = {
  setDate: PropTypes.func.isRequired, // setDate should be a required function
};

export default DatePicker;
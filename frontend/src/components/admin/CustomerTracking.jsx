import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useCustomerTracking } from '../../hooks/useCustomerTracking';
import '../../css/admin/CustomerTracking.css';

function CustomerTracking() {
  // Use current date in local timezone
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate());
  });
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const { customerData, isLoading, error, fetchCustomerData } = useCustomerTracking(selectedDate);

  useEffect(() => {
    // Create a new date object at midnight of the selected date
    const localDate = new Date(
      selectedDate.getFullYear(), 
      selectedDate.getMonth(), 
      selectedDate.getDate(), 
      0, 0, 0  // Set to midnight
    );
    
    console.log('Fetching data for date:', localDate.toISOString());
    fetchCustomerData(localDate);
  }, [selectedDate, fetchCustomerData]);

  const handleDateChange = (date) => {
    // Ensure the selected date is at midnight in local timezone
    const localDate = new Date(
      date.getFullYear(), 
      date.getMonth(), 
      date.getDate(), 
      0, 0, 0  // Set to midnight
    );
    
    console.log('Selected date object:', localDate);
    setSelectedDate(localDate);
    setIsDatePickerOpen(false);
  };

  const toggleDatePicker = () => {
    setIsDatePickerOpen(!isDatePickerOpen);
  };

  return (
    <div className="member-tracking">
      <div className="member-tracking-header">
        <h1>Customer Tracking</h1>
        <div className="date-section" style={{ position: 'relative' }}>
          <button onClick={toggleDatePicker}>
            {selectedDate.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </button>
          {isDatePickerOpen && (
            <div className="date-picker-overlay">
              <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                inline
                onClickOutside={() => setIsDatePickerOpen(false)}
                maxDate={new Date()}
              />
            </div>
          )}
        </div>
      </div>


      {/* Loading State */}
      {isLoading && <div className="loading-container">Loading customer data...</div>}

      {/* Error State */}
      {error && <div className="error-container">Error loading data: {error}</div>}

      {/* Empty State */}
      {customerData.length === 0 && <div className="empty-container">No customer data found for the selected date.</div>}

      {/* Main Render */}
      {customerData.length > 0 && (
        <table className="member-tracking-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Timestamp</th>
              <th>Role</th>
              <th>Payment</th>
            </tr>
          </thead>
          <tbody>
            {customerData.map((customer, index) => (
              <tr key={index}>
                <td>{customer.name}</td>
                <td>{customer.timestamp}</td>
                <td>{customer.role}</td>
                <td>{customer.payment ? `₱${parseFloat(customer.payment).toFixed(2)}` : 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default CustomerTracking;
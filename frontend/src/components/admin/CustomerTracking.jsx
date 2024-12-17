import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useCustomerTracking } from '../../hooks/useCustomerTracking';
import '../../css/admin/CustomerTracking.css';

function CustomerTracking() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false); // State to manage date picker visibility
  const { customerData, isLoading, error, fetchCustomerData } = useCustomerTracking(selectedDate);

  useEffect(() => {
    fetchCustomerData(selectedDate);
  }, [selectedDate]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setIsDatePickerOpen(false); // Close the date picker after selecting a date
  };

  const toggleDatePicker = () => {
    setIsDatePickerOpen(!isDatePickerOpen); // Toggle the date picker visibility
  };

  return (
    <div className="member-tracking">
      <div className="member-tracking-header">
        <h1>Customer Tracking</h1>
        <div className="date-section" style={{ position: 'relative' }}> {/* Set position relative for the parent */}
          <button onClick={toggleDatePicker}>
            {selectedDate.toLocaleDateString()} {/* Display the selected date */}
          </button>
          {isDatePickerOpen && (
            <div className="date-picker-overlay"> {/* Overlay container */}
              <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                inline // Display the date picker inline
                onClickOutside={() => setIsDatePickerOpen(false)} // Close when clicking outside
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
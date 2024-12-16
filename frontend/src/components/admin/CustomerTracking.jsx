import React, { useState, useEffect } from 'react';
import { useCustomerTracking } from '../../hooks/useCustomerTracking';
import DatePicker from './DatePicker';
import '../../css/admin/CustomerTracking.css';

function CustomerTracking() {
  // State to manage the selected date
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    // Ensure it's in local timezone
    return today.toLocaleDateString('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).split('/').reverse().join('-');
  });
  
  // Use the custom hook with the selected date
  const { 
    customerData, 
    isLoading, 
    error,
    fetchCustomerData
  } = useCustomerTracking(selectedDate);

  // Debug logging
  useEffect(() => {
    console.log('Selected Date:', selectedDate);
    console.log('Customer Data Length:', customerData.length);
  }, [selectedDate, customerData]);

  // Render methods
  const renderHeader = () => (
    <div className="member-tracking-header">
      <h1>Customer Tracking</h1>
      <div className="date-section">
        <DatePicker setDate={setSelectedDate} />
      </div>
    </div>
  );

  // Loading State
  if (isLoading) {
    return (
      <div className="member-tracking">
        {renderHeader()}
        <div className="loading-container">
          Loading customer data...
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="member-tracking">
        {renderHeader()}
        <div className="error-container">
          <p>Error loading data: {error}</p>
        </div>
      </div>
    );
  }

  // Empty State
  if (!customerData || customerData.length === 0) {
    return (
      <div className="member-tracking">
        {renderHeader()}
        <div className="empty-container">
          <p>No customer data found for the selected date.</p>
        </div>
      </div>
    );
  }

  // Main Render
  return (
    <div className="member-tracking">
      {renderHeader()}
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
      <div className="table-footer">
        <p>Total Entries: {customerData.length}</p>
      </div>
    </div>
  );
}

export default CustomerTracking;
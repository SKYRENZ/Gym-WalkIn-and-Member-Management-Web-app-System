import React, { useState, useEffect } from "react";
import Modal from 'react-modal';
import '../../css/counter/CheckInInfoModal.css';

const CheckInInfoModal = ({ isOpen, onClose, customerDetails, onCheckInSuccess }) => {
  useEffect(() => {
    console.log('Customer Details:', customerDetails); // Debugging information
  }, [customerDetails]);

  if (!customerDetails) return null;

  const handleCheckIn = async () => {
    try {
      const response = await fetch('http://localhost:3000/check-in', { // Ensure the correct backend URL
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ membership_id: customerDetails.membership_id, customer_id: customerDetails.customer_id }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        alert('Check-in successful');
        onCheckInSuccess(); // Notify parent component of successful check-in
        onClose(); // Close the modal after successful check-in
      } else {
        alert(`Check-in failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Error during check-in:', error);
      alert(`Error during check-in: ${error.message}`);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Check-In Information"
      className="checkInModalContent"
      overlayClassName="modalOverlay"
    >
      <div className="profile-container">
        <div className="profile-card">
          <form className="profile-form">
            <h2>Customer Profile</h2>
            <div className="form-group">
              <label>Name</label>
              <input type="text" value={customerDetails.name} readOnly />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input type="text" value={customerDetails.contact_info} readOnly />
            </div>
            <div className="form-group">
              <label>E-Mail Account</label>
              <input type="text" value={customerDetails.email} readOnly />
            </div>
            <h2 className="subscription-title">Subscription Information</h2>
            <div className="form-group">
              <label>Start Date</label>
              <input type="text" value={new Date(customerDetails.start_date).toLocaleDateString()} readOnly />
            </div>
            <div className="form-group">
              <label>Expiry Date</label>
              <input type="text" value={new Date(customerDetails.end_date).toLocaleDateString()} readOnly />
            </div>
          </form>
        </div>
        {/* QR Code Section */}
        <div className="qr-section">
          <div className="qr-code">
            <img
              src="https://via.placeholder.com/150" // Placeholder image
              alt="QR Code"
            />
          </div>
          <div className="attendance">
            <h2>Attendance Time</h2>
            <div className="attendance-info">
              <div>
                <label>Date</label>
                <input type="text" className="attendance-input" value={new Date().toLocaleDateString()} readOnly />
              </div>
              <div>
                <label>Time</label>
                <input type="text" className="attendance-input" value={new Date().toLocaleTimeString()} readOnly />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="buttons">
        <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
        <button type="button" className="checkin-btn" onClick={handleCheckIn}>Check In</button>
      </div>
    </Modal>
  );
};

export default CheckInInfoModal;
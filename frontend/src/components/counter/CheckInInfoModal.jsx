import React from "react";
import '../../css/counter/CustomerProfile.css';

const CustomerProfile = () => {
  return (
    <div className="profile-container">
      <div className="profile-card">
        {/* Customer Profile Section */}
        <div className="customer-profile">
          <h2>Customer Profile</h2>
          <div className="profile-info">
            <label>Name</label>
            <input type="text" value="Juan Dela Cruz" readOnly />
          </div>
          <div className="profile-info">
            <label>Phone Number</label>
            <input type="text" value="0991 473 6802" readOnly />
          </div>
          <div className="profile-info">
            <label>E-Mail Account</label>
            <input type="text" value="jasonwilliams@gmail.com" readOnly />
          </div>
        </div>

        {/* Subscription Information */}
        <div className="subscription-info">
          <h2>Subscription Information</h2>
          <div className="dates">
            <div>
              <label>Start Date</label>
              <input type="text" value="October 13, 2024" readOnly />
            </div>
            <div>
              <label>Expiry Date</label>
              <input type="text" value="November 13, 2024" readOnly />
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Section */}
      <div className="qr-section">
        <div className="qr-code">
          <img
            src="https://via.placeholder.com/150" // Replace with your QR Code image source
            alt="QR Code"
          />
        </div>
        <div className="attendance">
          <h2>Attendance Time</h2>
          <div className="attendance-info">
            <div>
              <label>Date</label>
              <input type="text" value="November 14, 2024" readOnly />
            </div>
            <div>
              <label>Time</label>
              <input type="text" value="10:00AM" readOnly />
            </div>
          </div>
          <div className="buttons">
            <button className="cancel-btn">Cancel</button>
            <button className="checkin-btn">Check In</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;

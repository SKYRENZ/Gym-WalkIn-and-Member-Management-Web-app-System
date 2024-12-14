import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/admin/CustomerRecords.css";

const CustomerRecords = () => {
  const [view, setView] = useState("WalkIn");
  const [selectedRow, setSelectedRow] = useState(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showTotalRecordsModal, setShowTotalRecordsModal] = useState(false);

  const navigate = useNavigate();

  const handleRowClick = (index) => {
    if (view === "Member") {
      setSelectedRow(index);
    }
  };

  const handleViewChange = (viewName) => {
    setView(viewName);
    setSelectedRow(null);
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const openInfoModal = () => {
    setShowInfoModal(true);
  };

  const closeInfoModal = () => {
    setShowInfoModal(false);
  };

  const openTotalRecordsModal = () => {
    setShowTotalRecordsModal(true);
  };

  const closeTotalRecordsModal = () => {
    setShowTotalRecordsModal(false);
  };

  return (
    <div className="container">
      {/* Darkened Background Overlay (always shown when Customer Records is active) */}
      {(view === "WalkIn" || view === "Member") && (
        <div className="overlay"></div>
      )}

      {/* Customer Records Modal */}
      {!showInfoModal && !showTotalRecordsModal && (
        <div className="box">
          <div className="header-box">
            <button className="back-btn" onClick={handleBackClick}>
              ←
            </button>
            <h1 className="header">Customer Records</h1>
          </div>
          <hr className="header-separator-line" />

          <div className="button-container">
            <div className="search-container">
              <input type="text" className="search-bar" placeholder="Search..." />
            </div>
            <div className="view-buttons">
              <button
                className={view === "WalkIn" ? "active-btn" : "btn"}
                onClick={() => handleViewChange("WalkIn")}
              >
                Walk In
              </button>
              <button
                className={view === "Member" ? "active-btn" : "btn"}
                onClick={() => handleViewChange("Member")}
              >
                Member
              </button>
            </div>
          </div>

          <div className="table-section">
            <div className="customer-table">
              <div className="table-header">
                <span className="header-item">Name</span>
                <span className="header-item">Entries</span>
                <span className="header-item">Date Paid</span>
              </div>
              <hr className="separator-line" />
              {/* Static data removed, keeping table structure */}
              <div className="table-row">
                <span className="row-item">N/A</span>
                <span className="row-item">N/A</span>
                <span className="row-item">N/A</span>
              </div>
              <div className="table-row">
                <span className="row-item">N/A</span>
                <span className="row-item">N/A</span>
                <span className="row-item">N/A</span>
              </div>
              <div className="table-row">
                <span className="row-item">N/A</span>
                <span className="row-item">N/A</span>
                <span className="row-item">N/A</span>
              </div>
              <div className="table-row">
                <span className="row-item">N/A</span>
                <span className="row-item">N/A</span>
                <span className="row-item">N/A</span>
              </div>
            </div>
          </div>

          <div className="action-buttons">
            <div className="left-buttons">
              {view === "Member" && (
                <>
                  <button
                    className="btn"
                    onClick={openInfoModal}
                  >
                    Information
                  </button>
                  <button
                    className="btn"
                    onClick={openTotalRecordsModal}
                  >
                    Total Records
                  </button>
                </>
              )}
            </div>
            <div className="right-buttons">
              <button className="deactivated-btn">Deactivated Accounts</button>
            </div>
          </div>
        </div>
      )}

      {/* Information Modal */}
      {showInfoModal && (
        <div className="box information-modal">
          <div className="header-box">
            <button className="back-btn" onClick={closeInfoModal}>
              ←
            </button>
            <h1 className="header">Customer Information</h1>
          </div>
          <hr className="header-separator-line" />
          <div className="information-content">
            <div className="information-row">
              <strong>Name:</strong>
              <span>N/A</span>
            </div>
            <div className="information-row">
              <strong>Gender:</strong>
              <span>N/A</span>
            </div>
            <div className="information-row">
              <strong>Birthday:</strong>
              <span>N/A</span>
            </div>
            <div className="information-row">
              <strong>Phone Number:</strong>
              <span>N/A</span>
            </div>
            <div className="information-row">
              <strong>Email:</strong>
              <span>N/A</span>
            </div>
          </div>
        </div>
      )}

      {/* Total Records Modal */}
{showTotalRecordsModal && (
  <div className="box total-records-modal">
    <div className="header-box">
      <button className="back-btn" onClick={closeTotalRecordsModal}>
        ←
      </button>
      <h1 className="header">Total Records</h1>
    </div>
    <hr className="header-separator-line" />
    <div className="customer-name">
      <h2>N/A</h2> {/* Placeholder for customer name */}
    </div>
    <div className="records-table">
      <div className="table-header">
        <span>Payment Amount</span>
        <span>Payment Method</span>
        <span>Date of Payments</span>
      </div>
      <hr className="separator-line" />
      {/* Placeholder rows for data */}
      <div className="table-row">
        <span>N/A</span> {/* Placeholder for payment amount */}
        <span>N/A</span> {/* Placeholder for payment method */}
        <span>N/A</span> {/* Placeholder for payment date */}
      </div>
      <div className="table-row">
        <span>N/A</span> {/* Placeholder for payment amount */}
        <span>N/A</span> {/* Placeholder for payment method */}
        <span>N/A</span> {/* Placeholder for payment date */}
      </div>
    </div>
    <div className="total-info">
      <p>Total Entries: <span>N/A</span></p> {/* Placeholder for total entries */}
      <p>Total Payment: <span>N/A</span></p> {/* Placeholder for total payment */}
    </div>
  </div>
)}

    </div>
  );
};

export default CustomerRecords;
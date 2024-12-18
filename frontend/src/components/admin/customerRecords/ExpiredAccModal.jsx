import React, { useState, useEffect } from "react";
import Modal from 'react-modal';
import "../../../css/admin/ExpiredAccModal.css";
import BackIcon from '../../../assets/Back.png';
import SearchBar from '../../counter/SearchBar.jsx';
import ActivateAccModal from './ActivateAccModal.jsx';

Modal.setAppElement('#root'); // Set the root element for accessibility

const ExpiredAccModal = ({ isOpen, onClose }) => {
  const [view, setView] = useState("Expired");
  const [selectedRow, setSelectedRow] = useState(null);
  const [showActivateModal, setShowActivateModal] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSelectedRow(null);
    }
  }, [isOpen]);

  const handleRowClick = (index) => {
    if (view === "Blacklisted") {
      setSelectedRow(selectedRow === index ? null : index);
    }
  };

  const handleViewChange = (viewName) => {
    setView(viewName);
    setSelectedRow(null);
  };

  const openActivateModal = () => {
    setShowActivateModal(true);
  };

  const closeActivateModal = () => {
    setShowActivateModal(false);
    setSelectedRow(null); // Reset selected row when modal is closed
  };

  const handleActivate = () => {
    // Add your activation logic here
    console.log(`Activating account for row ${selectedRow}`);
    setSelectedRow(null); // Reset selected row after activation
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onRequestClose={onClose}
        contentLabel="Expired Accounts Modal"
        className="expiredAccModalContent"
        overlayClassName="expiredAccModalOverlay"
      >
        <div className="AccountHeader">
          <button className="accountBackButton" onClick={onClose}>
            <img src={BackIcon} alt="Back Icon" />
          </button>
          <h2>Deactivated Accounts</h2>
        </div>
        
        <div className="expired-button-container">
          <div className="expired-search-container">
            <SearchBar onSearch={handleSearch}/>
          </div>
          <div className="expired-view-buttons">
            <button
              className={view === "Expired" ? "expired-active-btn" : "expired-btn"}
              onClick={() => handleViewChange("Expired")}
            >
              Expired Accounts
            </button>
            <button
              className={view === "Blacklisted" ? "expired-active-btn" : "expired-btn"}
              onClick={() => handleViewChange("Blacklisted")}
            >
              Blacklisted
            </button>
          </div>
        </div>

        <div className="expired-table-section">
          <table className="expired-customer-table">
            <thead>
              <tr className="table-header">
                {view === "Expired" ? (
                  <>
                    <th>Name</th>
                    <th>Last Date of Payment</th>
                  </>
                ) : (
                  <>
                    <th>Name</th>
                    <th>Reason</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {/* Static data removed, keeping table structure */}
              <tr
                className={`table-row ${view === "Blacklisted" && selectedRow === 0 ? "selected" : ""}`}
                onClick={() => handleRowClick(0)}
              >
                <td>N/A</td>
                <td>N/A</td>
              </tr>
            </tbody>
          </table>
        </div>

        {view === "Blacklisted" && (
          <div className="expired-action-buttons">
            <button
              className="expired-activate-btn"
              onClick={openActivateModal}
              disabled={selectedRow === null}
            >
              Activate
            </button>
          </div>
        )}
      </Modal>

      <ActivateAccModal
        isOpen={showActivateModal}
        onClose={closeActivateModal}
        onConfirm={handleActivate}
      />
    </>
  );
};

export default ExpiredAccModal;
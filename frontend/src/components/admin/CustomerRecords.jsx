import React, { useState, useEffect } from "react";
import Modal from 'react-modal';
import { useNavigate } from "react-router-dom";
import "../../css/admin/CustomerRecords.css";
import BackIcon from '../../assets/Back.png';
import SearchBar from '../counter/SearchBar.jsx';
import InformationModal from './InformationModal.jsx';
import TotalRecordsModal from './TotalRecordsModal.jsx';

Modal.setAppElement('#root'); // Set the root element for accessibility

const CustomerRecords = ({ isOpen, onClose }) => {
  const [view, setView] = useState("WalkIn");
  const [selectedRow, setSelectedRow] = useState(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showTotalRecordsModal, setShowTotalRecordsModal] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) {
      setSelectedRow(null);
    }
  }, [isOpen]);

  const handleRowClick = (index) => {
    if (view === "Member") {
      setSelectedRow(selectedRow === index ? null : index);
    }
  };

  const handleViewChange = (viewName) => {
    setView(viewName);
    setSelectedRow(null);
  };

  const openInfoModal = () => {
    setShowInfoModal(true);
  };

  const closeInfoModal = () => {
    setShowInfoModal(false);
    setSelectedRow(null); // Reset selected row when modal is closed
  };

  const openTotalRecordsModal = () => {
    setShowTotalRecordsModal(true);
  };

  const closeTotalRecordsModal = () => {
    setShowTotalRecordsModal(false);
    setSelectedRow(null); // Reset selected row when modal is closed
  };

  return (
    <>
      <Modal
        isOpen={isOpen && !showInfoModal && !showTotalRecordsModal}
        onRequestClose={onClose}
        contentLabel="Customer Records Modal"
        className="customerRecordsModalContent"
        overlayClassName="customerRecordsModalOverlay"
      >
        <div className="AccountHeader">
          <button className="accountBackButton" onClick={onClose}>
            <img src={BackIcon} alt="Back Icon" />
          </button>
          <h2>Customer Records</h2>
        </div>
        
        <div className="button-container">
          <div className="search-container">
            <SearchBar />
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
          {view === "WalkIn" ? (
            <table className="customer-table">
              <thead>
                <tr className="table-header">
                  <th>Name</th>
                  <th>Entries</th>
                  <th>Date Paid</th>
                </tr>
              </thead>
              <tbody>
                {/* Static data removed, keeping table structure */}
                <tr className="table-row">
                  <td>N/A</td>
                  <td>N/A</td>
                  <td>N/A</td>
                </tr>
              </tbody>
            </table>
          ) : (
            <table className="customer-table">
              <thead>
                <tr className="table-header">
                  <th>Name</th>
                  <th>Entries</th>
                  <th>Date Paid</th>
                </tr>
              </thead>
              <tbody>
                {/* Static data removed, keeping table structure */}
                <tr
                  className={`table-row ${selectedRow === 0 ? "selected" : ""}`}
                  onClick={() => handleRowClick(0)}
                >
                  <td>N/A</td>
                  <td>N/A</td>
                  <td>N/A</td>
                </tr>
              </tbody>
            </table>
          )}
        </div>

        <div className="action-buttons">
          <div className="left-buttons">
            {view === "Member" && (
              <>
                <button
                  className="btn"
                  onClick={openInfoModal}
                  disabled={selectedRow === null}
                >
                  Information
                </button>
                <button
                  className="btn"
                  onClick={openTotalRecordsModal}
                  disabled={selectedRow === null}
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
      </Modal>

      <InformationModal isOpen={showInfoModal} onClose={closeInfoModal} />
      <TotalRecordsModal isOpen={showTotalRecordsModal} onClose={closeTotalRecordsModal} />
    </>
  );
};

export default CustomerRecords;
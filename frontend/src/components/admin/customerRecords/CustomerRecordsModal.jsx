import React, { useState } from 'react';
import Modal from 'react-modal';
import { useCustomerRecords } from '../../../hooks/useCustomerRecords';
import "../../../css/admin/CustomerRecordsModal.css";
import BackIcon from '../../../assets/Back.png';
import SearchBar from '../../counter/SearchBar.jsx';

const CustomerRecordsModal = ({ isOpen, onClose }) => {
  const [view, setView] = useState("WalkIn");
  const [searchTerm, setSearchTerm] = useState("");
  const currentYear = new Date().getFullYear();

  // Destructure data, loading, and error from the hook
  const { 
    data = [], // Provide a default empty array
    loading, 
    error 
  } = useCustomerRecords(currentYear, view === "WalkIn" ? "Walk In" : "Member");

  const handleViewChange = (viewName) => {
    setView(viewName);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Safely filter the data
  const filteredData = (data || []).filter(record => 
    record && record.names && record.names.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderTableRows = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan="3">Loading...</td>
        </tr>
      );
    }

    if (error) {
      return (
        <tr>
          <td colSpan="3">Error: {error}</td>
        </tr>
      );
    }

    if (!filteredData || filteredData.length === 0) {
      return (
        <tr>
          <td colSpan="3">No records found</td>
        </tr>
      );
    }

    return filteredData.map((record, index) => (
      <tr key={index}>
        <td>{record.names}</td>
        <td>{record.total_entries}</td>
        <td>{record.last_payment_date}</td>
      </tr>
    ));
  };

  // Calculate total entries safely
  const totalEntries = filteredData.reduce((sum, record) => 
    sum + (record.total_entries || 0), 0);

  return (
    <Modal
      isOpen={isOpen}
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
          <SearchBar 
            placeholder="Search by name"
            value={searchTerm}
            onChange={handleSearchChange}
          />
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
        <div className="table-summary">
          <span>Total Entries: {totalEntries}</span>
        </div>
        <table className="customer-table">
          <thead>
            <tr className="table-header">
              <th>Name</th>
              <th>Total Entries</th>
              <th>Last Payment Date</th>
            </tr>
          </thead>
          <tbody>
            {renderTableRows()}
          </tbody>
        </table>
      </div>
    </Modal>
  );
};

export default CustomerRecordsModal;
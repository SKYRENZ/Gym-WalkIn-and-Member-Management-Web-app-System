import { useState } from 'react';
import Modal from 'react-modal';
import { useCustomerRecords } from '../../../hooks/useCustomerRecords';
import "../../../css/admin/CustomerRecordsModal.css";
import BackIcon from '../../../assets/Back.png';
import SearchBar from '../../counter/SearchBar.jsx';

const CustomerRecords = ({ isOpen, onClose }) => {
  const [view, setView] = useState("WalkIn");
  const currentYear = new Date().getFullYear();

  const { 
    data: customerData, 
    loading, 
    error 
  } = useCustomerRecords(currentYear, view === "WalkIn" ? "Walk In" : "Member");

  const handleViewChange = (viewName) => {
    setView(viewName);
  };

  // Render table rows
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

    if (!customerData || customerData.length === 0) {
      return (
        <tr>
          <td colSpan="3">No records found</td>
        </tr>
      );
    }

    return customerData.map((record, index) => (
      <tr key={index}>
        <td>{record.names}</td>
        <td>{record.total_entries}</td>
        <td>{record.date}</td>
      </tr>
    ));
  };

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
        <table className="customer-table">
          <thead>
            <tr className="table-header">
              <th>Name</th>
              <th>Entries</th>
              <th>Date</th>
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

export default CustomerRecords;
import { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { useCustomerRecords } from '../../../hooks/useCustomerRecords';
import InformationModal from './InformationModal';
import TotalRecordsModal from './TotalRecordsModal';
import ReasonModal from './ReasonModal';
import ExpiredAccModal from './ExpiredAccModal';
import "../../../css/admin/CustomerRecordsModal.css";
import BackIcon from '../../../assets/Back.png';
import SearchBar from '../../counter/SearchBar.jsx';
import PropTypes from 'prop-types';

const CustomerRecordsModal = ({ isOpen, onClose }) => {
  const [view, setView] = useState("WalkIn");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isTotalRecordsModalOpen, setIsTotalRecordsModalOpen] = useState(false);
  const [isReasonModalOpen, setIsReasonModalOpen] = useState(false);
  const [isExpiredAccModalOpen, setIsExpiredAccModalOpen] = useState(false);
  const [deactivationReason, setDeactivationReason] = useState("");
  const currentYear = new Date().getFullYear();

  // Fetch records for both Walk-In and Member
  const { 
    data = [], 
    loading, 
    error 
  } = useCustomerRecords(currentYear, view === "WalkIn" ? "Walk In" : "Member");

  useEffect(() => {
    if (isOpen) {
      setSelectedCustomer(null);
    }
  }, [isOpen]);

  const handleViewChange = (viewName) => {
    setView(viewName);
    setSearchTerm("");
    setSelectedCustomer(null);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  // Safely filter the data
  const filteredData = (data || []).filter(record => 
    record && record.names && record.names.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRowClick = (customerName) => {
    if (view === "Member") {
      setSelectedCustomer(customerName === selectedCustomer ? null : customerName);
    }
  };

  const renderTableRows = () => {
    if (loading) return <tr><td colSpan="3">Loading...</td></tr>;
    if (error) return <tr><td colSpan="3">Error: {error}</td></tr>;
    if (!filteredData.length) return <tr><td colSpan="3">No records found</td></tr>;

    return filteredData.map((record, index) => (
      <tr 
        key={index} 
        onClick={() => handleRowClick(record.names)}
        className={view === "Member" ? "member-row" : ""}
        style={{
          backgroundColor: selectedCustomer === record.names ? '#e0e0e0' : 'transparent',
          cursor: view === "Member" ? 'pointer' : 'default'
        }}
      >
        <td>{record.names}</td>
        <td>{record.total_entries}</td>
        <td>{record.last_payment_date}</td>
      </tr>
    ));
  };

  const handleDeactivate = () => {
    // Add your deactivation logic here
    console.log(`Deactivating account for ${selectedCustomer} with reason: ${deactivationReason}`);
    setIsReasonModalOpen(false);
    setSelectedCustomer(null);
    setDeactivationReason("");
  };

  return (
    <>
      <Modal
        isOpen={isOpen && !isInfoModalOpen && !isTotalRecordsModalOpen && !isExpiredAccModalOpen}
        onRequestClose={onClose}
        className="customerRecordsModalContent"
        overlayClassName="customerRecordsModalOverlay"
      >
        <div className="AccountHeader">
          <button className="accountBackButton" onClick={onClose}>
            <img src={BackIcon} alt="Back Icon" />
          </button>
          <h2>Customer Records</h2>
        </div>
        
        <div className="search-button-container">
          <div className="search-container">
            <SearchBar onSearch={handleSearch} />
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
              <tr>
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
  
        {view === "Member" && (
          <>
            <div className="member-action-buttons">
              <button 
                className="info-btn"
                disabled={!selectedCustomer}
                onClick={() => setIsInfoModalOpen(true)}
              >
                Information
              </button>
              <button 
                className="total-records-btn"
                disabled={!selectedCustomer}
                onClick={() => setIsTotalRecordsModalOpen(true)}
              >
                Total Records
              </button>
              <button 
                className="deactivate-btn"
                disabled={!selectedCustomer}
                onClick={() => setIsReasonModalOpen(true)}
              >
                Deactivate
              </button>
            </div>
            <div className="deactivated-accounts-button">
              <button 
                className="deactivated-btn"
                onClick={() => setIsExpiredAccModalOpen(true)}
              >
                Deactivated Accounts
              </button>
            </div>
          </>
        )}
      </Modal>
  
      {/* Modals */}
      <InformationModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        customerName={selectedCustomer}
      />
  
      <TotalRecordsModal
        isOpen={isTotalRecordsModalOpen}
        onClose={() => setIsTotalRecordsModalOpen(false)}
        customerName={selectedCustomer}
      />
  
      <ReasonModal
        isOpen={isReasonModalOpen}
        onClose={() => setIsReasonModalOpen(false)}
        selectedRow={selectedCustomer}
        deactivationReason={deactivationReason}
        setDeactivationReason={setDeactivationReason}
        handleDeactivate={handleDeactivate}
      />
  
      <ExpiredAccModal
        isOpen={isExpiredAccModalOpen}
        onClose={() => setIsExpiredAccModalOpen(false)}
      />
    </>
  );
};

CustomerRecordsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default CustomerRecordsModal;
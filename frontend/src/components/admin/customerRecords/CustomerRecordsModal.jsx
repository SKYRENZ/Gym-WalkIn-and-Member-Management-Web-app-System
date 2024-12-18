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
  const [localData, setLocalData] = useState([]); 

  // Fetch records for both Walk-In and Member
  const { 
    data = [], 
    loading, 
    error,
  } = useCustomerRecords(currentYear, view === "WalkIn" ? "Walk In" : "Member");
  useEffect(() => {
    setLocalData(data);
  }, [data]);

  // Implement handleSearchChange
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

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

  // Safely filter the data
  const filteredData = (data || []).filter(record => 
    record && record.names && record.names.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRowClick = (customerName) => {
    if (view === "Member") {
      setSelectedCustomer(customerName === selectedCustomer ? null : customerName);
    }
  };
  const handleDeactivate = async () => {
    if (!selectedCustomer || !deactivationReason.trim()) {
      alert('Please provide a reason for deactivation');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/deactivateCustomerMembership`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: selectedCustomer,
          reason: deactivationReason
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh the data
        refetch(); // Assuming your hook has a refetch method
        
        // Close modals and reset state
        setIsReasonModalOpen(false);
        setSelectedCustomer(null);
        setDeactivationReason("");
        
        // Optional: Show success message
        alert('Customer membership deactivated successfully');
      } else {
        // Handle error response
        alert(data.error || 'Failed to deactivate customer membership');
      }
    } catch (error) {
      console.error('Error deactivating customer membership:', error);
      alert('An error occurred while deactivating the membership');
    }
  };

  const renderTableRows = () => {
    if (loading) return <tr><td colSpan="3">Loading...</td></tr>;
    if (error) return <tr><td colSpan="3">Error: {error}</td></tr>;
    if (!filteredData.length) return <tr><td colSpan="3">No records found</td></tr>;

    return localData.filter(record => 
      record && record.names && record.names.toLowerCase().includes(searchTerm.toLowerCase())
    ).map((record, index) => (
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
            <SearchBar 
              onSearchChange={handleSearchChange}
              placeholder="Search customers..."
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
        onUpdateSuccess={(updatedInfo) => {
          // Update local data directly
          setLocalData(prevData => 
            prevData.map(record => 
              record.names === updatedInfo.oldName 
                ? { ...record, names: updatedInfo.newName } 
                : record
            )
          );
        }}
      />
  
      <TotalRecordsModal
        isOpen={isTotalRecordsModalOpen}
        onClose={() => setIsTotalRecordsModalOpen(false)}
        customerName={selectedCustomer}
      />
  
  <ReasonModal
        isOpen={isReasonModalOpen}
        onClose={() => {
          setIsReasonModalOpen(false);
          setDeactivationReason("");
        }}
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
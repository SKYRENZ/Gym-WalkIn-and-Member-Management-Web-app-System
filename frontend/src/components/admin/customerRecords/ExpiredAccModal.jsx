import  { useState, useEffect } from "react";
import Modal from 'react-modal';
import PropTypes from 'prop-types';
import api from '../../../api';
import "../../../css/admin/ExpiredAccModal.css";
import BackIcon from '../../../assets/Back.png';
import SearchBar from '../../counter/SearchBar.jsx';
import ActivateAccModal from './ActivateAccModal.jsx';

Modal.setAppElement('#root');

const ExpiredAccModal = ({ isOpen, onClose }) => {
  const [view, setView] = useState("Expired");
  const [deactivatedMembers, setDeactivatedMembers] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchDeactivatedMembers();
    }
  }, [isOpen]);

  const fetchDeactivatedMembers = async () => {
    try {
      const response = await api.get('/getDeactivatedMembers');
      setDeactivatedMembers(response.data);
    } catch (error) {
      console.error('Error fetching deactivated members:', error);
      alert('Failed to fetch deactivated members');
    }
  };

  const handleRowClick = (index) => {
    if (view === "Blacklisted") {
      setSelectedRow(selectedRow === index ? null : index);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const filteredMembers = deactivatedMembers.filter(member => 
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (view === "Expired" 
      ? member.deactivation_type === "Expired" 
      : member.deactivation_type === "Blacklisted")
  );

  const handleViewChange = (viewName) => {
    setView(viewName);
    setSelectedRow(null);
  };

  const openActivateModal = () => {
    setShowActivateModal(true);
  };

  const closeActivateModal = () => {
    setShowActivateModal(false);
    setSelectedRow(null);
  };

  const handleActivate = async () => {
    if (!filteredMembers[selectedRow]) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/reactivateCustomerMembership`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: filteredMembers[selectedRow].name
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh the list of deactivated members
        fetchDeactivatedMembers();
        
        // Close the activate modal
        closeActivateModal();
        
        alert('Customer membership reactivated successfully');
      } else {
        alert(data.error || 'Failed to reactivate customer membership');
      }
    } catch (error) {
      console.error('Error reactivating customer membership:', error);
      alert('An error occurred while reactivating the membership');
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onRequestClose={onClose}
        contentLabel="Deactivated Accounts Modal"
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
            <SearchBar 
              onSearch={handleSearch}
              placeholder="Search deactivated members..."
            />
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
                <th>Name</th>
                <th>Reason</th>
                <th>Deactivated At</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member, index) => (
                <tr
                  key={member.id}
                  className={`table-row ${view === "Blacklisted" && selectedRow === index ? "selected" : ""}`}
                  onClick={() => handleRowClick(index)}
                >
                  <td>{member.name}</td>
                  <td>{member.deactivation_reason}</td>
                  <td>
                    {new Date(member.deactivated_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {view === "Blacklisted" && selectedRow !== null && (
          <div className="expired-action-buttons">
            <button 
              className="activate-btn"
              onClick={openActivateModal}
            >
              Activate Account
            </button>
          </div>
        )}
      </Modal>

      {showActivateModal && (
        <ActivateAccModal
          isOpen={showActivateModal}
          onClose={closeActivateModal}
          memberName={filteredMembers[selectedRow]?.name}
          onActivate={handleActivate}
        />
      )}
    </>
  );
};

ExpiredAccModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default ExpiredAccModal;
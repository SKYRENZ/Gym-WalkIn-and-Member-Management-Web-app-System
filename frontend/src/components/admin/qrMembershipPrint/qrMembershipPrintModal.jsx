import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import '../../../css/admin/qrMembershipPrintModal.css';
import backIcon from '../../../assets/Back.png'; // Import the back icon
import searchIcon from '../../../assets/Search.png'; // Import the search icon

// Set the app element for accessibility
Modal.setAppElement('#root');

const QrMembershipPrintModal = ({ isOpen, onClose }) => {
  const [searchText, setSearchText] = useState('');
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch('/api/members');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setMembers(data);
      } catch (error) {
        console.error('Error fetching members:', error);
      }
    };

    if (isOpen) {
      fetchMembers();
    }
  }, [isOpen]);

  const handleSearchChange = (event) => {
    setSearchText(event.target.value);
  };

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Qr Membership Print"
      className="qr-modal-content qr-member-print"
      overlayClassName="qr-modal-overlay"
    >
      {/* Header */}
      <div className="modal-header">
        <img className="left" src={backIcon} alt="Back" onClick={onClose} />
        <div className="text-wrapper-9">Qr Membership Print</div>
      </div>

      {/* Main Content */}
      <div className="qr-modal-body">
        {/* Left Section */}
        <div className="left-section">
          <div className="transaction-search-container">
            <div className="transaction-search">
              <div className="search-container">
                <img className="vector" src={searchIcon} alt="Search" />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search"
                  value={searchText}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
          </div>
          <div className="members-list">
            <h2>Members</h2>
            <hr className="members-divider" />
            <ul>
              {filteredMembers.map((member, index) => (
                <li key={index}>{member.name}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Section */}
        <div className="qr-preview-container">
          <h3>Preview:</h3>
          <div className="preview-area"></div>
        </div>
      </div>
    </Modal>
  );
};

export default QrMembershipPrintModal;
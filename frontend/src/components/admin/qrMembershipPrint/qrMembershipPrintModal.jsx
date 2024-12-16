import React, { useState } from 'react';
import Modal from 'react-modal';
import '../../../css/admin/qrMembershipPrintModal.css';
import backIcon from '../../../assets/Back.png'; // Import the back icon
import searchIcon from '../../../assets/Search.png'; // Import the search icon

// Set the app element for accessibility
Modal.setAppElement('#root');

const QrMembershipPrintModal = ({ isOpen, onClose }) => {
  const [searchText, setSearchText] = useState('');

  const handleSearchChange = (event) => {
    setSearchText(event.target.value);
  };

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
      <div className="group-4">
        {/* Left Section */}
        <div className="group-5">
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
          <div className="group-627">
            <h2>Members</h2>
            <ul>
              <li>Juan Dela Cruz</li>
              <li>Maria Santos</li>
              <li>Carlos Reyes</li>
              <li>Ana Mendoza</li>
              <li>Luis Aquino</li>
              <li>Gary Vasquez</li>
            </ul>
          </div>
        </div>

        {/* Right Section */}
        <div className="group-629">
          <h3>Preview:</h3>
          <div className="preview-area"></div>
        </div>
      </div>
    </Modal>
  );
};

export default QrMembershipPrintModal;
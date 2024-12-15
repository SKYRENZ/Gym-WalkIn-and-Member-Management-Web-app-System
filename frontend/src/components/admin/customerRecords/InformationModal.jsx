import React from 'react';
import Modal from 'react-modal';
import '../../../css/admin/InformationModal.css';
import BackIcon from '../../../assets/Back.png';

Modal.setAppElement('#root'); // Set the root element for accessibility

const InformationModal = ({ isOpen, onClose }) => {
  const handleBackButtonClick = () => {
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Information Modal"
      className="informationModalContent"
      overlayClassName="informationModalOverlay"
    >
      <div className="VoucherHeader">
        <button className="voucherBackButton" onClick={handleBackButtonClick}>
          <img src={BackIcon} alt="Back Icon" />
        </button>
        <h2>Customer Information</h2>
      </div>

      <div className="informationForm">
        <label htmlFor="name">Full Name:</label>
        <input type="text" id="name" placeholder="Full Name" />

        <label htmlFor="gender">Gender:</label>
        <input type="text" id="gender" placeholder="Gender" />

        <label htmlFor="birthday">Birthday:</label>
        <input type="date" id="birthday" placeholder="Birthday" />

        <label htmlFor="phone">Phone Number:</label>
        <input type="text" id="phone" placeholder="Phone Number" />

        <label htmlFor="email">Email:</label>
        <input type="email" id="email" placeholder="Email" />
      </div>
    </Modal>
  );
};

export default InformationModal;
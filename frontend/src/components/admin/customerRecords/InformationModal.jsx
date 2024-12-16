import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import PropTypes from 'prop-types';
import '../../../css/admin/InformationModal.css';
import BackIcon from '../../../assets/Back.png';
import api from '../../../api'; // Assuming you have an API utility

Modal.setAppElement('#root'); // Set the root element for accessibility

const InformationModal = ({ 
  isOpen, 
  onClose, 
  customerName 
}) => {
  // State to manage customer information
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    gender: '',
    birthday: '',
    phone: '',
    email: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch customer information when modal opens
  useEffect(() => {
    const fetchCustomerInfo = async () => {
      if (isOpen && customerName) {
        setIsLoading(true);
        setError(null);
        try {
          // Replace with your actual API endpoint
          const response = await api.get(`/getCustomerMember_info/${customerName}`);
          
          // Update state with fetched information
          setCustomerInfo({
            name: response.data.name || customerName,
            gender: response.data.gender || '',
            birthday: response.data.birthday || '',
            phone: response.data.phone || '',
            email: response.data.email || ''
          });
        } catch (err) {
          console.error('Error fetching customer information:', err);
          setError('Failed to fetch customer information');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchCustomerInfo();
  }, [isOpen, customerName]);

  const handleBackButtonClick = () => {
    onClose();
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [id]: value
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Customer Information Modal"
      className="informationModalContent"
      overlayClassName="informationModalOverlay"
    >
      <div className="VoucherHeader">
        <button className="voucherBackButton" onClick={handleBackButtonClick}>
          <img src={BackIcon} alt="Back Icon" />
        </button>
        <h2>Customer Information</h2>
      </div>

      {isLoading && <div className="loading">Loading...</div>}
      {error && <div className="error">{error}</div>}

      <div className="informationForm">
        <label htmlFor="name">Full Name:</label>
        <input 
          type="text" 
          id="name" 
          placeholder="Full Name" 
          value={customerInfo.name}
          onChange={handleInputChange}
          disabled
        />

        <label htmlFor="gender">Gender:</label>
        <input 
          type="text" 
          id="gender" 
          placeholder="Gender" 
          value={customerInfo.gender}
          onChange={handleInputChange}
          disabled
        />

        <label htmlFor="birthday">Birthday:</label>
        <input 
          type="date" 
          id="birthday" 
          placeholder="Birthday" 
          value={customerInfo.birthday}
          onChange={handleInputChange}
          disabled
        />

        <label htmlFor="phone">Phone Number:</label>
        <input 
          type="text" 
          id="phone" 
          placeholder="Phone Number" 
          value={customerInfo.phone}
          onChange={handleInputChange}
          disabled
        />

        <label htmlFor="email">Email:</label>
        <input 
          type="email" 
          id="email" 
          placeholder="Email" 
          value={customerInfo.email}
          onChange={handleInputChange}
          disabled
        />
      </div>
    </Modal>
  );
};

// PropTypes validation
InformationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  customerName: PropTypes.string
};

// Optional default props
InformationModal.defaultProps = {
  customerName: ''
};

export default InformationModal;
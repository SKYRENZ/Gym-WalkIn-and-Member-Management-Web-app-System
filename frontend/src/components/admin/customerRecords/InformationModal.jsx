import { useState, useEffect } from 'react';
import Modal from 'react-modal';
import PropTypes from 'prop-types';
import '../../../css/admin/InformationModal.css';
import BackIcon from '../../../assets/Back.png';
import api from '../../../api';

Modal.setAppElement('#root');

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
  const [isEditing, setIsEditing] = useState(false);

  // Fetch customer information when modal opens
  useEffect(() => {
    const fetchCustomerInfo = async () => {
      if (isOpen && customerName) {
        setIsLoading(true);
        setError(null);
        try {
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

  // Handle input changes during editing
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setCustomerInfo(prevInfo => ({
      ...prevInfo,
      [id]: value
    }));
  };

  // Handle edit button click
  const handleEditClick = () => {
    setIsEditing(true);
  };

  // Handle cancel editing
  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  // Handle save changes
  const handleSaveChanges = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.put(`/updateCustomerInfo/${customerName}`, {
        name: customerInfo.name,
        email: customerInfo.email,
        phone: customerInfo.phone,
        membership_end_date: customerInfo.birthday
      });

      if (response.data) {
        setIsEditing(false);
        // Optionally refresh or update parent component
      }
    } catch (err) {
      console.error('Error updating customer information:', err);
      setError(err.response?.data?.error || 'Failed to update customer information');
    } finally {
      setIsLoading(false);
    }
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
        <button className="voucherBackButton" onClick={onClose}>
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
          disabled={!isEditing}
        />
        
        <label htmlFor="phone">Phone Number:</label>
        <input 
          type="text" 
          id="phone" 
          placeholder="Phone Number" 
          value={customerInfo.phone}
          onChange={handleInputChange}
          disabled={!isEditing}
        />

        <label htmlFor="email">Email:</label>
        <input 
          type="email" 
          id="email" 
          placeholder="Email" 
          value={customerInfo.email}
          onChange={handleInputChange}
          disabled={!isEditing}
        />

        {/* Edit Button */}
        {!isEditing && (
          <div className="edit-button-container">
            <button 
              className="editInfoButton" 
              onClick={handleEditClick}
            >
              Edit
            </button>
          </div>
        )}

        {/* Edit/Save Actions */}
        {isEditing && (
          <div className="edit-actions">
            <button 
              className="cancel-edit-btn" 
              onClick={handleCancelEdit}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button 
              className="save-edit-btn" 
              onClick={handleSaveChanges}
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
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
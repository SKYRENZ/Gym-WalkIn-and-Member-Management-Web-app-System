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
  customerName,
  onUpdateSuccess
}) => {
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    birthday: '' // Membership end date
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [originalInfo, setOriginalInfo] = useState({});

  // Fetch customer information when modal opens
  useEffect(() => {
    const fetchCustomerInfo = async () => {
      if (isOpen && customerName) {
        setIsLoading(true);
        setError(null);
        try {
          const response = await api.get(`/getCustomerMember_info/${customerName}`);
          
          const fetchedInfo = {
            name: response.data.name || customerName,
            email: response.data.email || '',
            phone: response.data.phone || '',
            birthday: response.data.end_date || ''
          };

          setCustomerInfo(fetchedInfo);
          setOriginalInfo(fetchedInfo);
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

  // Cleanup effect to reset state when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false);
      setError(null);
    }
  }, [isOpen]);

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

  // Handle cancel editing - revert to original information
  const handleCancelEdit = () => {
    setCustomerInfo(originalInfo);
    setIsEditing(false);
    setError(null);
  };

  // Handle save changes
  const handleSaveChanges = async () => {
    // Validate inputs
    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      setError('Name, email, and phone are required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.put(`/updateCustomerInfo/${customerName}`, {
        name: customerInfo.name,
        email: customerInfo.email,
        phone: customerInfo.phone,
        // Remove membership_end_date from update
      });

      if (response.data) {
        // Immediately update the original info with the new data
        setOriginalInfo(customerInfo);
        setIsEditing(false);
        
        // Notify parent component of successful update
        if (onUpdateSuccess) {
          onUpdateSuccess({
            oldName: customerName,
            newName: customerInfo.name,
            ...customerInfo
          });
        }
      }
    } catch (err) {
      console.error('Error updating customer information:', err);
      setError(err.response?.data?.error || 'Failed to update customer information');
    } finally {
      setIsLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
      {error && <div className="error-message">{error}</div>}

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

        <label>Membership End Date:</label>
        <input 
          type="text" 
          value={formatDate(customerInfo.birthday)}
          readOnly
          className="readonly-input"
        />
      </div>

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
    </Modal>
  );
};

// PropTypes validation
InformationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  customerName: PropTypes.string,
  onUpdateSuccess: PropTypes.func
};

// Optional default props
InformationModal.defaultProps = {
  customerName: '',
  onUpdateSuccess: () => {}
};

export default InformationModal;
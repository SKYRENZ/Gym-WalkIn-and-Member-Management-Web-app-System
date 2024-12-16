import  { useState, useEffect } from 'react';
import Modal from 'react-modal';
import PropTypes from 'prop-types';
import api from '../../../api';

const EditCustomerModal = ({ 
  isOpen, 
  onClose, 
  customerName, 
  onUpdateSuccess 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    membership_end_date: ''
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch customer data when modal opens
  useEffect(() => {
    const fetchCustomerData = async () => {
      if (isOpen && customerName) {
        try {
          const response = await api.get(`/getCustomerMember_info/${customerName}`);
          const customerData = response.data;
          
          setFormData({
            name: customerData.name || customerName,
            email: customerData.email || '',
            phone: customerData.phone || '',
            membership_end_date: customerData.end_date || ''
          });
        } catch (err) {
          console.error('Error fetching customer data:', err);
          setError('Failed to fetch customer information');
        }
      }
    };

    fetchCustomerData();
  }, [isOpen, customerName]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [id]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.put(`/updateCustomerInfo/${customerName}`, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        membership_end_date: formData.membership_end_date
      });
      
      // If update is successful
      if (response.data) {
        onUpdateSuccess(formData);
        onClose();
      }
    } catch (err) {
      console.error('Error updating customer:', err);
      setError(err.response?.data?.error || 'Failed to update customer');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Edit Customer Modal"
      className="editCustomerModalContent"
      overlayClassName="editCustomerModalOverlay"
    >
      <div className="modal-header">
        <h2>Edit Customer Information</h2>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">Phone Number</label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="membership_end_date">Membership End Date</label>
          <input
            type="date"
            id="membership_end_date"
            value={formData.membership_end_date ? 
              new Date(formData.membership_end_date).toISOString().split('T')[0] : 
              ''
            }
            onChange={handleInputChange}
          />
        </div>

        <div className="modal-actions">
          <button 
            type="button" 
            className="cancel-btn"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="save-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Updating...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

EditCustomerModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  customerName: PropTypes.string.isRequired,
  onUpdateSuccess: PropTypes.func.isRequired
};

export default EditCustomerModal;
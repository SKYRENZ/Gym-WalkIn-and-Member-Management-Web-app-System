import  { useState, useEffect } from 'react';
import Modal from 'react-modal';
import '../../../css/admin/EditAccountModal.css';
import BackIcon from '../../../assets/Back.png';
import PropTypes from 'prop-types';

Modal.setAppElement('#root'); // Set the root element for accessibility

function EditAccountModal({ isOpen, onClose, account }) {
    const [formData, setFormData] = useState({
        name: '',
        role: '',
        contact_info: '',
        password: '' // Optional password change
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Populate form with existing account data when modal opens
    useEffect(() => {
        if (account && isOpen) {
            setFormData({
                name: account.name || '',
                role: account.role || 'receptionist',
                contact_info: account.contact_info || '',
                password: '' // Keep password field empty by default
            });
            // Clear any previous messages
            setError('');
            setSuccess('');
        }
    }, [account, isOpen]);

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [id]: value
        }));
    };

    const handleSaveChanges = async () => {
        // Validate input
        if (!formData.name || !formData.role) {
            setError('Name and role are required');
            return;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/updateStaff/${account.staff_id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    role: formData.role,
                    contact_info: formData.contact_info || null,
                    // Only send password if it's been changed
                    ...(formData.password && { password: formData.password })
                })
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('Account updated successfully');
                setError('');
                
                // Optional: Close modal after successful update
                setTimeout(() => {
                    onClose();
                }, 1500);
            } else {
                setError(data.error || 'Failed to update account');
            }
        } catch (err) {
            console.error('Error updating account:', err);
            setError('An error occurred while updating the account');
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            contentLabel="Edit Account Modal"
            className="editAccountModalContent"
            overlayClassName="editAccountModalOverlay"
        >
            <div className="AccountHeader">
                <button className="accountBackButton" onClick={onClose}>
                    <img src={BackIcon} alt="Back Icon" />
                </button>
                <h2>Edit Account</h2>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <div className="editAccountForm">
                <label htmlFor="name">Name:</label>
                <input 
                    type="text" 
                    id="name" 
                    placeholder="Name" 
                    value={formData.name}
                    onChange={handleInputChange}
                />

                <label htmlFor="role">Role:</label>
                <select 
                    id="role"
                    value={formData.role}
                    onChange={handleInputChange}
                >
                    <option value="receptionist">Receptionist</option>
                    <option value="admin">Admin</option>
                </select>

                <label htmlFor="contact_info">Contact Info (Optional):</label>
                <input 
                    type="text" 
                    id="contact_info" 
                    placeholder="Contact Information" 
                    value={formData.contact_info}
                    onChange={handleInputChange}
                />

                <label htmlFor="password">Change Password (Optional):</label>
                <input 
                    type="password" 
                    id="password" 
                    placeholder="Leave blank to keep current password" 
                    value={formData.password}
                    onChange={handleInputChange}
                />
            </div>
                
            <button 
                className="saveBtn" 
                onClick={handleSaveChanges}
            >
                Save Changes
            </button>
        </Modal>
    );
}
EditAccountModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    account: PropTypes.shape({
        staff_id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        role: PropTypes.string.isRequired,
        contact_info: PropTypes.string,
    }).isRequired
};

export default EditAccountModal;
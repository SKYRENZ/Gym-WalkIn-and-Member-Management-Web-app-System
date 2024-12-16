import  { useState } from 'react';
import Modal from 'react-modal';
import '../../../css/admin/AddAccountModal.css';
import BackIcon from '../../../assets/Back.png';
import PropTypes from 'prop-types';

Modal.setAppElement('#root');

function AddAccountModal({ isOpen, onClose }) {
    const [formData, setFormData] = useState({
        name: '',
        password: '',
        role: 'receptionist', // Default role
        contact_info: '' // Optional contact info
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [id]: value
        }));
    };

    const handleAddAccount = async () => {
        // Validation
        if (!formData.name || !formData.password) {
            setError('Please fill in name and password');
            return;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/addStaff`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    password: formData.password,
                    role: formData.role,
                    contact_info: formData.contact_info || null
                })
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('Account created successfully');
                setError('');
                // Reset form
                setFormData({
                    name: '',
                    password: '',
                    role: 'receptionist',
                    contact_info: ''
                });
                // Optionally close the modal after successful creation
                onClose();
            } else {
                setError(data.error || 'Failed to create account');
            }
        } catch (err) {
            console.error('Error creating account:', err);
            setError('An error occurred while creating the account');
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            contentLabel="Add Account Modal"
            className="addAccountModalContent"
            overlayClassName="addAccountModalOverlay"
        >
            <div className="AccountHeader">
                <button className="accountBackButton" onClick={onClose}>
                    <img src={BackIcon} alt="Back Icon" />
                </button>
                <h2>Add Account</h2>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <div className="addAccountForm">
                <label htmlFor="name">Name:</label>
                <input 
                    type="text" 
                    id="name" 
                    placeholder="Name" 
                    value={formData.name}
                    onChange={handleInputChange}
                />

                <label htmlFor="password">Password:</label>
                <input 
                    type="password" 
                    id="password" 
                    placeholder="Password" 
                    value={formData.password}
                    onChange={handleInputChange}
                />

                <label htmlFor="contact_info">Contact Info (Optional):</label>
                <input 
                    type="text" 
                    id="contact_info" 
                    placeholder="Contact Information" 
                    value={formData.contact_info}
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
            </div>
                
            <button 
                className="addAccountBtn" 
                onClick={handleAddAccount}
            >
                Add Account
            </button>
        </Modal>
    );
}
AddAccountModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired
};

export default AddAccountModal;
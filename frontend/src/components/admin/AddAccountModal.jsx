import React from 'react';
import Modal from 'react-modal';
import '../../css/admin/AddAccountModal.css';
import BackIcon from '../../assets/Back.png';

Modal.setAppElement('#root'); // Set the root element for accessibility

function AddAccountModal({ isOpen, onClose }) {
    const handleAddAccount = () => {
        // Handle add account logic here
        console.log('Add Account');
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            contentLabel="Add Account Modal"
            className="addAccountModalContent"
            overlayClassName="addAccountModalOverlay" // Use the new overlay class
        >
            <div className="AccountHeader">
                <button className="accountBackButton" onClick={onClose}>
                    <img src={BackIcon} alt="Back Icon" />
                </button>
                <h2>Add Account</h2>
            </div>

            <div className="addAccountForm">
                <label htmlFor="name">Name:</label>
                <input type="text" id="name" placeholder="Name" />

                <label htmlFor="email">Email:</label>
                <input type="email" id="email" placeholder="Email" />

                <label htmlFor="password">Password:</label>
                <input type="password" id="password" placeholder="Password" />

                <label htmlFor="role">Role:</label>
                <select id="role">
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                </select>
            </div>
                
            <button className="addAccountBtn" onClick={handleAddAccount}>Add Account</button>
        </Modal>
    );
}

export default AddAccountModal;
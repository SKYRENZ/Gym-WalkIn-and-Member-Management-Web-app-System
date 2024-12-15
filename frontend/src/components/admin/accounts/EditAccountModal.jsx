import React from 'react';
import Modal from 'react-modal';
import '../../../css/admin/EditAccountModal.css';
import BackIcon from '../../../assets/Back.png';

Modal.setAppElement('#root'); // Set the root element for accessibility

function EditAccount({ isOpen, onClose }) {

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            contentLabel="Edit Account Modal"
            className="editAccountModalContent"
            overlayClassName="editAccountModalOverlay" // Use the new overlay class
        >
            <div className="AccountHeader">
                <button className="accountBackButton" onClick={onClose}>
                    <img src={BackIcon} alt="Back Icon" />
                </button>
                <h2>Edit Account</h2>
            </div>

            <div className="editAccountForm">
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
                
            <button className="saveBtn">Save</button>
        </Modal>
    );
}

export default EditAccount;
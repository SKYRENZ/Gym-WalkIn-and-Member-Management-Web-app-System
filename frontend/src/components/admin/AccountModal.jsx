import React, { useState } from 'react';
import Modal from 'react-modal';
import '../../css/admin/AccountModal.css';
import BackIcon from '../../assets/Back.png';
import AccountModalBtns from './AccountModalBtns.jsx';
import AddAccountModal from './AddAccountModal.jsx';
import EditAccountModal from './EditAccountModal.jsx';

Modal.setAppElement('#root'); // Set the root element for accessibility

function AccountModal({ isOpen, onClose }) {
    const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);
    const [isEditAccountModalOpen, setIsEditAccountModalOpen] = useState(false);

    const handleAddAccount = () => {
        setIsAddAccountModalOpen(true);
    };

    const handleDeactivate = () => {
        // Handle deactivate logic here
        console.log('Deactivate');
    };

    const closeAddAccountModal = () => {
        setIsAddAccountModalOpen(false);
    };

    const handleEditAccount = () => {
        setIsEditAccountModalOpen(true);
    };

    const closeEditAccountModal = () => {
        setIsEditAccountModalOpen(false);
    };

    return (
        <>
            <Modal
                isOpen={isOpen && !isAddAccountModalOpen && !isEditAccountModalOpen}
                onRequestClose={onClose}
                contentLabel="Account Modal"
                className="accountModalContent"
                overlayClassName="accountModalOverlay"
            >
                <div className="AccountHeader">
                    <button className="accountBackButton" onClick={onClose}>
                        <img src={BackIcon} alt="Back Icon" />
                    </button>
                    <h2>Accounts</h2>
                </div>

                <div className="accountList">
                    <div className="accountItem">
                        <button className="editButton" onClick={handleEditAccount}>Edit</button>
                        <p><strong>Name:</strong></p>
                        <p><strong>Email:</strong></p>
                        <p><strong>Password:</strong></p>
                        <p><strong>Role:</strong></p>
                    </div>
                    <div className="accountItem">
                        <button className="editButton" onClick={handleEditAccount}>Edit</button>
                        <p><strong>Name:</strong></p>
                        <p><strong>Email:</strong></p>
                        <p><strong>Password:</strong></p>
                        <p><strong>Role:</strong></p>
                    </div>
                </div>

                <AccountModalBtns onAddAccount={handleAddAccount} onDeactivate={handleDeactivate} />
            </Modal>

            <AddAccountModal isOpen={isAddAccountModalOpen} onClose={closeAddAccountModal} />
            <EditAccountModal isOpen={isEditAccountModalOpen} onClose={closeEditAccountModal} />
        </>
    );
}

export default AccountModal;
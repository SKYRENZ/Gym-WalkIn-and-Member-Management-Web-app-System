import React, { useState } from 'react';
import Modal from 'react-modal';
import '../../css/admin/AccountModal.css';
import BackIcon from '../../assets/Back.png';
import AccountModalBtns from './AccountModalBtns.jsx';
import AddAccountModal from './AddAccountModal.jsx';
import EditAccountModal from './EditAccountModal.jsx';
import DeactivateAccModal from './DeactivateAccModal.jsx';

Modal.setAppElement('#root'); // Set the root element for accessibility

function AccountModal({ isOpen, onClose }) {
    const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);
    const [isEditAccountModalOpen, setIsEditAccountModalOpen] = useState(false);
    const [isDeactivateAccountModalOpen, setIsDeactivateAccountModalOpen] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState(null);

    const handleAddAccount = () => {
        setIsAddAccountModalOpen(true);
    };

    const handleDeactivate = () => {
        setIsDeactivateAccountModalOpen(true);
    };

    const closeAddAccountModal = () => {
        setIsAddAccountModalOpen(false);
    };

    const handleEditAccount = () => {
        setIsEditAccountModalOpen(true);
    };

    const closeEditAccountModal = () => {
        setIsEditAccountModalOpen(false);
        setSelectedAccount(null);
    };

    const closeDeactivateAccountModal = () => {
        setIsDeactivateAccountModalOpen(false);
    };

    const handleAccountClick = (account) => {
        if (selectedAccount === account) {
            setSelectedAccount(null); // Deselect account if it is already selected
        } else {
            setSelectedAccount(account);
        }
    };

    const handleClose = () => {
        setSelectedAccount(null); // Reset selected account when closing AccountModal
        onClose();
    };

    return (
        <>
            <Modal
                isOpen={isOpen && !isAddAccountModalOpen && !isEditAccountModalOpen}
                onRequestClose={handleClose}
                contentLabel="Account Modal"
                className="accountModalContent"
                overlayClassName="accountModalOverlay"
            >
                <div className="AccountHeader">
                    <button className="accountBackButton" onClick={handleClose}>
                        <img src={BackIcon} alt="Back Icon" />
                    </button>
                    <h2>Accounts</h2>
                </div>

                <div className="accountList">
                    <button
                        className={`accountItem ${selectedAccount === 'account1' ? 'selected' : ''}`}
                        onClick={() => handleAccountClick('account1')}
                    >
                        <p><strong>Name:</strong></p>
                        <p><strong>Email:</strong></p>
                        <p><strong>Password:</strong></p>
                        <p><strong>Role:</strong></p>
                    </button>
                </div>

                <AccountModalBtns
                    onAddAccount={handleAddAccount}
                    onEditAccount={handleEditAccount}
                    onDeactivate={handleDeactivate}
                    isEditDisabled={!selectedAccount}
                    isDeactivateDisabled={!selectedAccount}
                />
            </Modal>

            <AddAccountModal isOpen={isAddAccountModalOpen} onClose={closeAddAccountModal} />
            <EditAccountModal isOpen={isEditAccountModalOpen} onClose={closeEditAccountModal} />
            <DeactivateAccModal isOpen={isDeactivateAccountModalOpen} onClose={closeDeactivateAccountModal} />
        </>
    );
}

export default AccountModal;
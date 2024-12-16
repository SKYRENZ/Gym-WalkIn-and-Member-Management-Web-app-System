import { useState, useEffect } from 'react';
import Modal from 'react-modal';
import '../../../css/admin/AccountModal.css';
import BackIcon from '../../../assets/Back.png';
import AccountModalBtns from './AccountModalBtns.jsx';
import AddAccountModal from './AddAccountModal.jsx';
import EditAccountModal from './EditAccountModal.jsx';
import DeactivateAccModal from './DeactivateAccModal.jsx';
import DeactivatedAccountsModal from './DeactivatedAccountsModal.jsx';
import PropTypes from 'prop-types';
Modal.setAppElement('#root');

function AccountModal({ isOpen, onClose }) {
    const [accounts, setAccounts] = useState([]);
    const [deactivatedAccounts, setDeactivatedAccounts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);
    const [isEditAccountModalOpen, setIsEditAccountModalOpen] = useState(false);
    const [isDeactivateAccountModalOpen, setIsDeactivateAccountModalOpen] = useState(false);
    const [isDeactivatedAccountsModalOpen, setIsDeactivatedAccountsModalOpen] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState(null);

    // Fetch accounts when the modal opens
    useEffect(() => {
        if (isOpen) {
            fetchAccounts();
            fetchDeactivatedAccounts();
        }
    }, [isOpen]);

    // Fetch all active staff accounts
    const fetchAccounts = async () => {
        setIsLoading(true);
        setError('');
    
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/getStaffAccounts`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch accounts');
            }
    
            const data = await response.json();
            
            setAccounts(data);
            
        } catch (err) {
            console.error('Error fetching accounts:', err);
            setError('Unable to load accounts. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch deactivated staff accounts
    const fetchDeactivatedAccounts = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/getDeactivatedStaffAccounts`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setDeactivatedAccounts(data);
        } catch (err) {
            console.error('Error fetching deactivated accounts:', err);
        }
    };

    const handleAddAccount = () => {
        setIsAddAccountModalOpen(true);
    };

    const handleEditAccount = () => {
        if (selectedAccount) {
            setIsEditAccountModalOpen(true);
        }
    };

    const handleDeactivate = () => {
        if (selectedAccount) {
            setIsDeactivateAccountModalOpen(true);
        }
    };

    const handleViewDeactivatedAccounts = () => {
        setIsDeactivatedAccountsModalOpen(true);
    };

    const closeAddAccountModal = () => {
        setIsAddAccountModalOpen(false);
        fetchAccounts();
    };

    const closeEditAccountModal = () => {
        setIsEditAccountModalOpen(false);
        setSelectedAccount(null);
        fetchAccounts();
    };

    const closeDeactivateAccountModal = () => {
        setIsDeactivateAccountModalOpen(false);
        setSelectedAccount(null);
        fetchAccounts();
        fetchDeactivatedAccounts();
    };

    const closeDeactivatedAccountsModal = () => {
        setIsDeactivatedAccountsModalOpen(false);
        fetchAccounts();
        fetchDeactivatedAccounts();
    };

    const handleAccountClick = (account) => {
        setSelectedAccount(prevSelected => 
            prevSelected && prevSelected.staff_id === account.staff_id ? null : account
        );
    };

    const handleClose = () => {
        setSelectedAccount(null);
        onClose();
    };

    return (
        <>
            <Modal
                isOpen={isOpen && !isAddAccountModalOpen && !isEditAccountModalOpen && !isDeactivatedAccountsModalOpen}
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

                {isLoading && <p>Loading accounts...</p>}
                {error && <p className="error-message">{error}</p>}

                <div className="accountList">
                    {accounts.map((account) => (
                        <button
                            key={account.staff_id}
                            className={`accountItem ${selectedAccount?.staff_id === account.staff_id ? 'selected' : ''}`}
                            onClick={() => handleAccountClick(account)}
                        >
                            <p><strong>Name:</strong> {account.name}</p>
                            <p><strong>Role:</strong> {account.role}</p>
                            <p><strong>Contact Info:</strong> {account.contact_info || 'N/A'}</p>
                        </button>
                    ))}
                </div>

                <AccountModalBtns
                    onAddAccount={handleAddAccount}
                    onEditAccount={handleEditAccount}
                    onDeactivate={handleDeactivate}
                    onViewDeactivated={handleViewDeactivatedAccounts}
                    isEditDisabled={!selectedAccount}
                    isDeactivateDisabled={!selectedAccount}
                />
            </Modal>

            {/* Modals */}
            <AddAccountModal 
                isOpen={isAddAccountModalOpen} 
                onClose={closeAddAccountModal} 
            />
            
            {selectedAccount && (
                <>
                    <EditAccountModal 
                        isOpen={isEditAccountModalOpen} 
                        onClose={closeEditAccountModal}
                        account={selectedAccount}
                    />
                    
                    <DeactivateAccModal 
                        isOpen={isDeactivateAccountModalOpen} 
                        onClose={closeDeactivateAccountModal}
                        account={selectedAccount}
                    />
                </>
            )}

            <DeactivatedAccountsModal
                isOpen={isDeactivatedAccountsModalOpen}
                onClose={closeDeactivatedAccountsModal}
                deactivatedAccounts={deactivatedAccounts}
            />
        </>
    );
}
AccountModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired
};
export default AccountModal;
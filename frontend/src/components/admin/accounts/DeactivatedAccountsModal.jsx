import  { useState } from 'react'; 
import PropTypes from 'prop-types';
import Modal from 'react-modal';
import '../../../css/admin/DeactivatedAccountsModal.css';
import BackIcon from '../../../assets/Back.png';

function DeactivatedAccountsModal({ isOpen, onClose, deactivatedAccounts }) {
    const [reactivatingId, setReactivatingId] = useState(null);

    const handleReactivate = async (account) => {
        setReactivatingId(account.staff_id);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/reactivateStaff/${account.staff_id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (response.ok) {
                // Refresh the list or close the modal
                onClose();
            } else {
                // Handle error
                console.error('Reactivation failed:', data.error);
                alert(data.error || 'Failed to reactivate account');
            }
        } catch (err) {
            console.error('Error reactivating account:', err);
            alert('An error occurred while reactivating the account');
        } finally {
            setReactivatingId(null);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            contentLabel="Deactivated Accounts Modal"
            className="deactivatedAccountsModalContent"
            overlayClassName="deactivatedAccountsModalOverlay"
        >
            <div className="AccountHeader">
                <button className="accountBackButton" onClick={onClose}>
                    <img src={BackIcon} alt="Back Icon" />
                </button>
                <h2>Deactivated Accounts</h2>
            </div>

            <div className="deactivatedAccountsList">
                {deactivatedAccounts.length === 0 ? (
                    <p className="no-accounts">No deactivated accounts found.</p>
                ) : (
                    deactivatedAccounts.map((account) => (
                        <div 
                            key={account.staff_id} 
                            className="deactivated-account-item"
                        >
                            <div className="account-details">
                                <p><strong>Name:</strong> {account.name}</p>
                                <p><strong>Role:</strong> {account.role}</p>
                                <p><strong>Contact Info:</strong> {account.contact_info || 'N/A'}</p>
                                <p><strong>Deactivated At:</strong> {new Date(account.deactivated_at).toLocaleString()}</p>
                            </div>
                            <button 
                                className="reactivate-btn"
                                onClick={() => handleReactivate(account)}
                                disabled={reactivatingId === account.staff_id}
                            >
                                {reactivatingId === account.staff_id ? 'Reactivating...' : 'Reactivate'}
                            </button>
                        </div>
                    ))
                )}
            </div>
        </Modal>
    );
}

DeactivatedAccountsModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    deactivatedAccounts: PropTypes.arrayOf(
        PropTypes.shape({
            staff_id: PropTypes.number.isRequired,
            name: PropTypes.string.isRequired,
            role: PropTypes.string.isRequired,
            contact_info: PropTypes.string,
            deactivated_at: PropTypes.string.isRequired
        })
    ).isRequired
};

export default DeactivatedAccountsModal;
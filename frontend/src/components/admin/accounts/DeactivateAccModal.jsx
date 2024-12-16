import { useState } from 'react'; 
import PropTypes from 'prop-types';
import Modal from 'react-modal';
import '../../../css/admin/DeactivateAccModal.css';

function DeactivateAccModal({ isOpen, onClose, account }) {
    const [isDeactivating, setIsDeactivating] = useState(false);
    const [error, setError] = useState('');

    const handleConfirm = async () => {
        setIsDeactivating(true);
        setError('');

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/deactivateStaff/${account.staff_id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (response.ok) {
                // Successfully deactivated
                onClose();
            } else {
                // Handle error from server
                setError(data.error || 'Failed to deactivate account');
            }
        } catch (err) {
            console.error('Error deactivating account:', err);
            setError('An error occurred while deactivating the account');
        } finally {
            setIsDeactivating(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            contentLabel="Deactivate Account Modal"
            className="deactivateAccountModalContent"
            overlayClassName="deactivateAccountModalOverlay"
        >
            <div>
                <h2>Deactivate Account</h2>
                <p>Are you sure you want to deactivate the account for {account.name}?</p>
                
                {error && <div className="error-message">{error}</div>}

                <div className="deactivateAccountButtons">
                    <button 
                        onClick={onClose} 
                        disabled={isDeactivating}
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleConfirm} 
                        disabled={isDeactivating}
                        className="deactivate-btn"
                    >
                        {isDeactivating ? 'Deactivating...' : 'Confirm Deactivation'}
                    </button>
                </div>
            </div>
        </Modal>
    );
}

// PropTypes Validation
DeactivateAccModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    account: PropTypes.shape({
        staff_id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        role: PropTypes.oneOf(['receptionist', 'admin']).isRequired
    }).isRequired
};

// Optional Default Props
DeactivateAccModal.defaultProps = {
    account: {
        staff_id: 0,
        name: 'Unknown User',
        role: 'receptionist'
    }
};

export default DeactivateAccModal;
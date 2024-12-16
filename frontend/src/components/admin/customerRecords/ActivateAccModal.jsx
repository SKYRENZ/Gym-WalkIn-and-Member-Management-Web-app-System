import React from 'react';
import Modal from 'react-modal';
import '../../../css/admin/ActivateAccModal.css';

function ActivateAccModal({ isOpen, onClose, onConfirm }) {

    const handleConfirm = () => {
        // Handle confirm logic here
        onConfirm();
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            contentLabel="Activate Account Modal"
            className="activateAccountModalContent"
            overlayClassName="activateAccountModalOverlay"
        >
            <div>
                <p>Are you sure you want to activate this account?</p>
                <div className="activateAccountButtons">
                    <button onClick={onClose}>Cancel</button>
                    <button onClick={handleConfirm}>Confirm</button>
                </div>
            </div>
        </Modal>
    )
}

export default ActivateAccModal;
import React from 'react';
import Modal from 'react-modal';
import '../../css/admin/DeactivateAccModal.css';

function DeactivateAccModal({ isOpen, onClose }){

    const handleConfirm = () => {
        // Handle confirm logic here
        console.log('Account deactivated');
        onClose();
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
                <p>Are you sure you want to deactivate this account?</p>
                <div className="deactivateAccountButtons">
                    <button onClick={onClose}>Cancel</button>
                    <button onClick={handleConfirm}>Confirm</button>
                </div>
            </div>
        </Modal>
    )
}

export default DeactivateAccModal;
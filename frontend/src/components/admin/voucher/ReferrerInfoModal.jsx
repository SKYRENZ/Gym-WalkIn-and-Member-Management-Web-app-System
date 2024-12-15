import React from 'react';
import Modal from 'react-modal';
import '../../../css/admin/ReferrerInfoModal.css';
import BackIcon from '../../../assets/Back.png';

Modal.setAppElement('#root');

function ReferrerInfoModal({ isOpen, onClose }) {
    const handleBackButtonClick = () => {
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            contentLabel="Referrer Info Modal"
            className="referrerInfoModalContent"
            overlayClassName="referrerInfoModalOverlay" // Use the new overlay class
        >
            <div className="VoucherHeader">
                <button className="voucherBackButton" onClick={handleBackButtonClick}>
                    <img src={BackIcon} alt="Back Icon" />
                </button>
                <h2>Referrer's Information</h2>
            </div>

            <div className="referrerInfoForm">
                <label htmlFor="name">Full Name:</label>
                <input type="text" id="name" placeholder="Full Name" />

                <label htmlFor="email">Phone Number:</label>
                <input type="text" id="phonenum" placeholder="Phone Number" />

                <label htmlFor="password">Email:</label>
                <input type="email" id="email" placeholder="Email" />

                <label htmlFor="expiration">Expiration:</label>
                <input type="email" id="expiration" placeholder="Expiration" />
            </div>
        </Modal>
    );
}

export default ReferrerInfoModal;
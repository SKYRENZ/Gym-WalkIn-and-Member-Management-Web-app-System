import React, { useState } from 'react';
import Modal from 'react-modal';
import BackIcon from '../../../assets/Back.png';
import '../../../css/admin/VoucherModal.css';
import MoreInfoBtn from './MoreInfoBtn.jsx';
import ReferrerInfoModal from './ReferrerInfoModal.jsx';

Modal.setAppElement('#root'); // Set the root element for accessibility

function VoucherModal({ isOpen, onClose }) {
    const [isMoreInfoModalOpen, setIsMoreInfoModalOpen] = useState(false);
    const [selectedVoucher, setSelectedVoucher] = useState(null);

    const handleMoreInfoBtn = () => {
        setIsMoreInfoModalOpen(true);
    };

    const closeMoreInfoModal = () => {
        setIsMoreInfoModalOpen(false);
        setSelectedVoucher(null); // Reset selected voucher when closing MoreInfoModal
    };

    const handleVoucherClick = (voucher) => {
        if (selectedVoucher === voucher) {
            setSelectedVoucher(null); // Deselect voucher if it is already selected
        } else {
            setSelectedVoucher(voucher);
        }
    };

    const handleClose = () => {
        setSelectedVoucher(null); // Reset selected voucher when closing VoucherModal
        onClose();
    };

    return (
        <>
            <Modal
                isOpen={isOpen && !isMoreInfoModalOpen}
                onRequestClose={handleClose}
                contentLabel="Voucher Modal"
                className="voucherModalContent"
                overlayClassName="voucherModalOverlay"
            >
                <div className="VoucherHeader">
                    <button className="voucherBackButton" onClick={handleClose}>
                        <img src={BackIcon} alt="Back Icon" />
                    </button>
                    <h2>Voucher</h2>
                </div>

                <div className="voucherList">
                    <button
                        className={`voucherItem ${selectedVoucher === 'voucher1' ? 'selected' : ''}`}
                        onClick={() => handleVoucherClick('voucher1')}
                    >
                        <p><strong>Voucher Id:</strong></p>
                        <p><strong>Uses Left:</strong></p>
                    </button>
                    {/* Add more voucher items as needed */}
                </div>

                <MoreInfoBtn onMoreInfoBtn={handleMoreInfoBtn} disabled={!selectedVoucher} />
            </Modal>

            <ReferrerInfoModal isOpen={isMoreInfoModalOpen} onClose={closeMoreInfoModal} />
        </>
    );
}

export default VoucherModal;
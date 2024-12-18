import React, { useState } from 'react';
import '../../css/admin/Navigation.css';
import customerRecords from '../../assets/Customer-Records.png';
import qrMembershipPrint from '../../assets/Qr.png';
import voucher from '../../assets/Voucher.png';
import accounts from '../../assets/Account.png';
import AccountModal from './accounts/AccountModal.jsx';
import VoucherModal from './voucher/VoucherModal.jsx';
import CustomerRecords from './customerRecords/CustomerRecordsModal.jsx';
import QrMembershipPrintModal from './qrMembershipPrint/qrMembershipPrintModal.jsx'; // Import the modal component

function Navigation() {
    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
    const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
    const [isCustomerRecordsModalOpen, setIsCustomerRecordsModalOpen] = useState(false);
    const [isQrMembershipPrintModalOpen, setIsQrMembershipPrintModalOpen] = useState(false); // State for QR Membership Print modal

    const openAccountModal = () => {
        setIsAccountModalOpen(true);
    };

    const closeAccountModal = () => {
        setIsAccountModalOpen(false);
    };

    const openVoucherModal = () => {
        setIsVoucherModalOpen(true);
    };

    const closeVoucherModal = () => {
        setIsVoucherModalOpen(false);
    };

    const openCustomerRecordsModal = () => {
        setIsCustomerRecordsModalOpen(true);
    };

    const closeCustomerRecordsModal = () => {
        setIsCustomerRecordsModalOpen(false);
    };

    const openQrMembershipPrintModal = () => {
        setIsQrMembershipPrintModalOpen(true);
    };

    const closeQrMembershipPrintModal = () => {
        setIsQrMembershipPrintModalOpen(false);
    };

    return (
        <div className="navigation">
            <button onClick={openCustomerRecordsModal}>
                <img src={customerRecords} alt="Customer Records" />
                <span>Customer Records</span>
            </button>
            <button onClick={openQrMembershipPrintModal}>
                <img src={qrMembershipPrint} alt="Qr Membership Print" />
                <span>Qr Membership Print</span>
            </button>
            <button onClick={openAccountModal}>
                <img src={accounts} alt="Accounts" />
                <span>Accounts</span>
            </button>
            <AccountModal isOpen={isAccountModalOpen} onClose={closeAccountModal} />
            <VoucherModal isOpen={isVoucherModalOpen} onClose={closeVoucherModal} />
            <CustomerRecords isOpen={isCustomerRecordsModalOpen} onClose={closeCustomerRecordsModal} />
            <QrMembershipPrintModal isOpen={isQrMembershipPrintModalOpen} onClose={closeQrMembershipPrintModal} /> {/* Add the modal component */}
        </div>
    );
}

export default Navigation;
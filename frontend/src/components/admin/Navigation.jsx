import React, { useState } from 'react';
import '../../css/admin/Navigation.css';
import customerRecords from '../../assets/Customer-Records.png';
import qrMembershipPrint from '../../assets/Qr.png';
import voucher from '../../assets/Voucher.png';
import accounts from '../../assets/Account.png';
import AccountModal from './accounts/AccountModal.jsx';
import VoucherModal from './voucher/VoucherModal.jsx';
import CustomerRecords from './customerRecords/CustomerRecordsModal.jsx';

function Navigation() {
    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
    const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
    const [isCustomerRecordsModalOpen, setIsCustomerRecordsModalOpen] = useState(false);

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

    return (
        <div className="navigation">
            <button onClick={openCustomerRecordsModal}>
                <img src={customerRecords} alt="Customer Records" />
                <span>Customer Records</span>
            </button>
            <button>
                <img src={qrMembershipPrint} alt="Qr Membership Print" />
                <span>Qr Membership Print</span>
            </button>
            <button onClick={openVoucherModal}>
                <img src={voucher} alt="Voucher" />
                <span>Voucher</span>
            </button>
            <button onClick={openAccountModal}>
                <img src={accounts} alt="Accounts" />
                <span>Accounts</span>
            </button>
            <AccountModal isOpen={isAccountModalOpen} onClose={closeAccountModal} />
            <VoucherModal isOpen={isVoucherModalOpen} onClose={closeVoucherModal} />
            <CustomerRecords isOpen={isCustomerRecordsModalOpen} onClose={closeCustomerRecordsModal} />
        </div>
    );
}

export default Navigation;
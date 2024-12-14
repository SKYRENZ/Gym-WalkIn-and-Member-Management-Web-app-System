import React, { useState } from 'react';
import '../../css/admin/Navigation.css';
import customerRecords from '../../assets/Customer-Records.png';
import qrMembershipPrint from '../../assets/Qr.png';
import voucher from '../../assets/Voucher.png';
import accounts from '../../assets/Account.png';
import AccountModal from './AccountModal.jsx';
import VoucherModal from './VoucherModal.jsx';

function Navigation() {
    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

    const openAccountModal = () => {
        setIsAccountModalOpen(true);
    };

    const closeAccountModal = () => {
        setIsAccountModalOpen(false);
    };

    const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);

    const openVoucherModal = () => {
        setIsVoucherModalOpen(true);
    }

    const closeVoucherModal = () => {
        setIsVoucherModalOpen(false);
    }

    return (
        <div className="navigation">
            <button>
                <img src={customerRecords} alt="Customer Records" />
                <span>Customer Records</span>
            </button>
            <button>
                <img src={qrMembershipPrint} alt="Qr Membership Print" />
                <span>Qr Membership Print</span>
            </button>
            <button onClick = {openVoucherModal}>
                <img src={voucher} alt="Voucher" />
                <span>Voucher</span>
            </button>
            <button onClick={openAccountModal}>
                <img src={accounts} alt="Accounts" />
                <span>Accounts</span>
            </button>
            <AccountModal isOpen={isAccountModalOpen} onClose={closeAccountModal} />
            <VoucherModal isOpen={isVoucherModalOpen} onClose={closeVoucherModal} />
        </div>
    );
}

export default Navigation;

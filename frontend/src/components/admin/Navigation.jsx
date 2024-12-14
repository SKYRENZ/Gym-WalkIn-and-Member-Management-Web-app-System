<<<<<<< Updated upstream
import React, { useState } from 'react';
=======
import { useNavigate } from 'react-router-dom';
>>>>>>> Stashed changes
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


<<<<<<< Updated upstream
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
=======
function Navigation() {
  const navigate = useNavigate(); // Get the navigate function

  const handleCustomerRecordsClick = () => {
    navigate("/admin/customer-records"); // Navigate to the Customer Records page
  };

  return (
    <div className="navigation">
      <button onClick={handleCustomerRecordsClick}>
        <img src={customerRecords} alt="Customer Records" />
        <span>Customer Records</span>
      </button>
      <button>
        <img src={qrMembershipPrint} alt="Qr Membership Print" />
        <span>Qr Membership Print</span>
      </button>
      <button>
        <img src={voucher} alt="Voucher" />
        <span>Voucher</span>
      </button>
      <button>
        <img src={accounts} alt="Accounts" />
        <span>Accounts</span>
      </button>
    </div>
  );
>>>>>>> Stashed changes
}

export default Navigation;

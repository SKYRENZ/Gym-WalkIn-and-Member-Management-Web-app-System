import './Navigation.css';
import customerRecords from './assets/Customer-Records.png';
import qrMembershipPrint from './assets/Qr.png';
import voucher from './assets/Voucher.png';
import accounts from './assets/Account.png';

function Navigation () {
    return (
        <div className="navigation">
            <button>
                <img src={customerRecords} alt="Customer Records"/>
                <span>Customer Records</span>
            </button>
            <button>
                <img src={qrMembershipPrint} alt="Qr Membership Print"/>
                <span>Qr Membership Print</span>
            </button>
            <button>
                <img src={voucher} alt="Voucher"/>
                <span>Voucher</span>
            </button>
            <button>
                <img src={accounts} alt="Accounts"/>
                <span>Accounts</span>
            </button>
        </div>
    )
}

export default Navigation;
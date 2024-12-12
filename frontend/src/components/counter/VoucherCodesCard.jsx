import voucherIcon from '../../assets/voucher icon.svg';

function VoucherCodesCard() {
    return (
        <div className="card voucher-codes">
            <h3>Voucher Codes</h3>
            <p>Remaining Redeemable Vouchers</p>
            <div className="number">4</div>
            <div className="icon">
                <img src={voucherIcon} alt="Voucher Icon" />
            </div>
        </div>
    );
}

export default VoucherCodesCard;
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { PRICES } from '/src/config';

const PAYMENT_METHODS = [
    'Cash',
    'Gcash',
    'Paymaya'
];

const PaymentMethodForm = ({ details, onChange, transactionType }) => {
    const [change, setChange] = useState(0);
    
    // Determine the correct fee based on transaction type
    const fee = transactionType === 'membership' 
        ? PRICES.NEW_MEMBERSHIP 
        : PRICES.WALK_IN;

    // Calculate change whenever received amount changes
    useEffect(() => {
        const receivedAmount = parseFloat(details.receivedAmount || 0);
        const calculatedChange = receivedAmount > fee 
            ? (receivedAmount - fee).toFixed(2)
            : 0;
        
        setChange(calculatedChange);
        onChange('change', calculatedChange);
    }, [details.receivedAmount, fee, onChange]);

    return (
        <div className="payment-method-container">
            <div className="input-wrapper">
                <label className="input-label">Payment Method</label>
                <div className="radio-wrapper">
                    {PAYMENT_METHODS.map((method) => (
                        <label key={method} className="radio-label">
                            <input
                                type="radio"
                                className="radio-input"
                                name="paymentMethod"
                                value={method}
                                checked={details.paymentMethod === method}
                                onChange={() => onChange('paymentMethod', method)}
                            />
                            {method}
                        </label>
                    ))}
                </div>
            </div>

            {details.paymentMethod === 'Cash' && (
                <>
                    <div className="input-wrapper">
                        <label className="input-label">
                            {transactionType === 'membership' ? 'Membership Fee' : 'Walk-in Fee'}
                        </label>
                        <input 
                            className="input-field"
                            type="text"
                            value={`₱${fee.toFixed(2)}`}
                            readOnly
                        />
                    </div>
                    <div className="input-wrapper">
                        <label className="input-label">Amount Received</label>
                        <input 
                            className="input-field"
                            type="number"
                            value={details.receivedAmount}
                            onChange={(e) => onChange('receivedAmount', e.target.value)}
                            placeholder="Enter Amount Received"
                            min={fee}
                        />
                    </div>
                    <div className="input-wrapper">
                        <label className="input-label">Change</label>
                        <input 
                            className="input-field"
                            type="text"
                            value={`₱${change}`}
                            readOnly
                        />
                    </div>
                </>
            )}

            {(details.paymentMethod === 'Gcash' || details.paymentMethod === 'Paymaya') && (
                <>
                    <div className="input-wrapper">
                        <label className="input-label">
                            {transactionType === 'membership' ? 'Membership Fee' : 'Walk-in Fee'}
                        </label>
                        <input 
                            className="input-field"
                            type="text"
                            value={`₱${fee.toFixed(2)}`}
                            readOnly
                        />
                    </div>
                    <div className="input-wrapper">
                        <label className="input-label">Reference Number</label>
                        <input 
                            className="input-field"
                            type="text"
                            value={details.referenceNumber}
                            onChange={(e) => onChange('referenceNumber', e.target.value)}
                            placeholder={`Enter ${details.paymentMethod} Reference Number`}
                        />
                    </div>
                </>
            )}
        </div>
    );
};

PaymentMethodForm.propTypes = {
    details: PropTypes.shape({
        paymentMethod: PropTypes.string,
        receivedAmount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        referenceNumber: PropTypes.string
    }).isRequired,
    onChange: PropTypes.func.isRequired,
    transactionType: PropTypes.oneOf(['walkIn', 'membership']).isRequired
};

export default PaymentMethodForm;
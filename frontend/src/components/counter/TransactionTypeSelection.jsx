import React, { useState } from 'react';
import GenericPopup from './GenericPopup';
import '../../css/counter/TransactionTypeSelection.css'; // Correct import for the CSS file
import BackIcon from '../../assets/Back.png'; // Importing the back icon

const TransactionTypeSelection = ({ onSelect }) => {
    const [showPopup, setShowPopup] = useState(false);
    const [step, setStep] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [transactionType, setTransactionType] = useState('');
    const [details, setDetails] = useState({
        name: '',
        phoneNumber: '',
        email: '',
        date: new Date().toLocaleDateString(),
        serviceFee: '100', // Example static service fee
        change: '[Fetched Data]', // Placeholder for fetched data
        receivedAmount: '', // Added receivedAmount to details
        referenceNumber: '', // Added referenceNumber to details
        voucherCode: '' // Added voucherCode to details
    });

    const resetState = () => {
        setPaymentMethod('');
        setDetails({
            name: '',
            phoneNumber: '',
            email: '',
            date: new Date().toLocaleDateString(),
            serviceFee: '100',
            change: '[Fetched Data]',
            receivedAmount: '',
            referenceNumber: '',
            voucherCode: ''
        });
    };

    const handleWalkInClick = () => {
        resetState();
        setShowPopup(true);
        setStep(1);
        setTransactionType('walkIn');
    };

    const handleMembershipClick = () => {
        resetState();
        setShowPopup(true);
        setStep(1);
        setTransactionType('membership');
    };

    const handleRenewalClick = () => {
        resetState();
        setShowPopup(true);
        setStep(1);
        setTransactionType('renewal');
    };

    const handleGroupMembershipClick = () => {
        resetState();
        setShowPopup(true);
        setStep(1);
        setTransactionType('groupMembership');
    };

    const handleClosePopup = () => {
        setShowPopup(false);
        setStep(1); // Reset to the first step
        resetState();
        setTransactionType('');
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        } else {
            setShowPopup(false);
        }
    };

    const handleContinue = () => {
        if (step < 3) {
            setStep(step + 1);
        } else {
            // Handle final continue action here
            setShowPopup(false);
            // Add any final submission logic here
        }
    };

    const handlePaymentChange = (event) => {
        setPaymentMethod(event.target.value);
    };

    const handleDetailsChange = (field, value) => {
        setDetails(prevDetails => ({
            ...prevDetails,
            [field]: value
        }));
    };

    return (
        <div className="transaction-type-selection">
            <div className="button-grid-container">
                <div className="button-grid">
                    <button className="transaction-button" onClick={handleWalkInClick}>Walk In</button>
                    <button className="transaction-button" onClick={handleMembershipClick}>Membership</button>
                    <button className="transaction-button" onClick={handleRenewalClick}>Renewal</button>
                    <button className="transaction-button" onClick={handleGroupMembershipClick}>Group Membership</button>
                </div>
            </div>
            <GenericPopup isOpen={showPopup} onClose={handleClosePopup} title="Transaction Details" step={step} onBack={handleBack}>
                {step === 1 && (
                    <div className="input-container">
                        <div className="input-wrapper">
                            <label className="input-label">{transactionType === 'walkIn' ? 'Nickname*' : 'Name*'}</label>
                            <input type="text" className="input-field" value={details.name} onChange={(e) => handleDetailsChange('name', e.target.value)} />
                        </div>
                        <div className="input-wrapper">
                            <label className="input-label">Phone Number*</label>
                            <input type="text" className="input-field" value={details.phoneNumber} onChange={(e) => handleDetailsChange('phoneNumber', e.target.value)} />
                        </div>
                        {(transactionType === 'membership' || transactionType === 'renewal' || transactionType === 'groupMembership') && (
                            <div className="input-wrapper">
                                <label className="input-label">Email*</label>
                                <input type="email" className="input-field" value={details.email} onChange={(e) => handleDetailsChange('email', e.target.value)} />
                            </div>
                        )}
                    </div>
                )}
                {step === 2 && (
                    <div className="input-container">
                        <div className="radio-wrapper">
                            <label className="radio-label">
                                <input type="radio" name="payment" value="cash" className="radio-input" checked={paymentMethod === 'cash'} onChange={handlePaymentChange} /> Cash
                            </label>
                            <label className="radio-label">
                                <input type="radio" name="payment" value="gcash" className="radio-input" checked={paymentMethod === 'gcash'} onChange={handlePaymentChange} /> GCash
                            </label>
                            <label className="radio-label">
                                <input type="radio" name="payment" value="maya" className="radio-input" checked={paymentMethod === 'maya'} onChange={handlePaymentChange} /> Maya
                            </label>
                            {(transactionType === 'membership' || transactionType === 'renewal') && (
                                <label className="radio-label">
                                    <input type="radio" name="payment" value="voucher" className="radio-input" checked={paymentMethod === 'voucher'} onChange={handlePaymentChange} /> Voucher
                                </label>
                            )}
                        </div>
                        {paymentMethod === 'cash' && (
                            <>
                                <div className="input-wrapper-horizontal-left">
                                    <label className="input-label-horizontal-left">Receive Amount</label>
                                    <input type="text" className="input-field-horizontal" value={details.receivedAmount} onChange={(e) => handleDetailsChange('receivedAmount', e.target.value)} />
                                </div>
                                <div className="input-wrapper-horizontal-left">
                                    <label className="input-label-horizontal-left">Change</label>
                                    <label className="input-field-horizontal">{details.change}</label>
                                </div>
                            </>
                        )}
                        {paymentMethod === 'gcash' && (
                            <div className="input-wrapper-horizontal-left">
                                <label className="input-label-horizontal-left">Reference Number</label>
                                <input type="text" className="input-field-horizontal" value={details.referenceNumber} onChange={(e) => handleDetailsChange('referenceNumber', e.target.value)} />
                            </div>
                        )}
                        {paymentMethod === 'maya' && (
                            <div className="input-wrapper-horizontal-left">
                                <label className="input-label-horizontal-left">Reference Number</label>
                                <input type="text" className="input-field-horizontal" value={details.referenceNumber} onChange={(e) => handleDetailsChange('referenceNumber', e.target.value)} />
                            </div>
                        )}
                        {paymentMethod === 'voucher' && (
                            <div className="input-wrapper-horizontal-left">
                                <label className="input-label-horizontal-left">Voucher Code</label>
                                <input type="text" className="input-field-horizontal" value={details.voucherCode} onChange={(e) => handleDetailsChange('voucherCode', e.target.value)} />
                            </div>
                        )}
                    </div>
                )}
                {step === 3 && (
                    <div className="input-container">
                        <div className="details-columns">
                            <div className="details-column">
                                <div className="payment-details-row">
                                    <label className="payment-details-label">Name:</label>
                                    <span className="payment-details-value">{details.name || ' Name'}</span>
                                </div>
                                <div className="payment-details-row">
                                    <label className="payment-details-label">Phone Number:</label>
                                    <span className="payment-details-value">{details.phoneNumber || ' Phone Number'}</span>
                                </div>
                                <div className="payment-details-row">
                                    <label className="payment-details-label">Email:</label>
                                    <span className="payment-details-value">{details.email || ' Email'}</span>
                                </div>
                            </div>
                            <div className="details-column">
                                <div className="payment-details-row">
                                    <label className="payment-details-label">Payment Method:</label>
                                    <span className="payment-details-value">{paymentMethod || 'Payment Method'}</span>
                                </div>
                                <div className="payment-details-row">
                                    <label className="payment-details-label">Transaction Type:</label>
                                    <span className="payment-details-value">{transactionType || 'Transaction Type'}</span>
                                </div>
                                <div className="payment-details-row">
                                    <label className="payment-details-label">Date:</label>
                                    <span className="payment-details-value">{details.date || 'Date'}</span>
                                </div>
                            </div>
                        </div>
                        <hr className="payment-details-divider" />
                        <div className="payment-summary-section">
                            <div className="payment-summary-row">
                                <label className="payment-summary-label">Service Fee:</label>
                                <span className="payment-summary-value">{details.serviceFee || ' Service Fee'}</span>
                            </div>
                            <div className="payment-summary-row">
                                <label className="payment-summary-label">Received Amount:</label>
                                <span className="payment-summary-value">{details.receivedAmount || ' Received Amount'}</span>
                            </div>
                            <div className="payment-summary-row">
                                <label className="payment-summary-label">Change:</label>
                                <span className="payment-summary-value">{details.change || 'Change'}</span>
                            </div>
                        </div>
                    </div>
                )}
                <div className="button-container">
                    <button onClick={handleClosePopup}>Cancel</button>
                    <button className="continue-button" onClick={handleContinue}>
                        {step === 3 ? 'Submit' : 'Continue'}
                    </button>
                </div>
            </GenericPopup>
        </div>
    );
};

export default TransactionTypeSelection;
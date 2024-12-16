import React, { useState } from 'react';
import GenericPopup from './GenericPopup';
import PaymentDetails from './PaymentDetails';
import '../../css/counter/PaymentDetails.css'; // Correct import for the CSS file

const TransactionTypeSelection = ({ onSelect }) => {
    const [showPopup, setShowPopup] = useState(false);
    const [showPaymentDetails, setShowPaymentDetails] = useState(false); // New state for PaymentDetails modal
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
    });

    const handleWalkInClick = () => {
        setShowPopup(true);
        setStep(1);
        setTransactionType('walkIn');
    };

    const handleMembershipClick = () => {
        setShowPopup(true);
        setStep(1);
        setTransactionType('membership');
    };

    const handleRenewalClick = () => {
        setShowPopup(true);
        setStep(1);
        setTransactionType('renewal');
    };

    const handleGroupMembershipClick = () => {
        setShowPopup(true);
        setStep(1);
        setTransactionType('groupMembership');
    };

    const handleClosePopup = () => {
        setShowPopup(false);
    };

    const handleClosePaymentDetails = () => {
        setShowPaymentDetails(false);
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        } else {
            setShowPopup(false);
        }
    };

    const handleContinue = () => {
        if (step < 2) {
            setStep(step + 1);
        } else {
            // Handle final continue action here
            setShowPopup(false);
            setShowPaymentDetails(true); // Show PaymentDetails modal
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
            <div className="button-grid">
                <button className="transaction-button" onClick={handleWalkInClick}>Walk In</button>
                <button className="transaction-button" onClick={handleMembershipClick}>Membership</button>
                <button className="transaction-button" onClick={handleRenewalClick}>Renewal</button>
                <button className="transaction-button" onClick={handleGroupMembershipClick}>Group Membership</button>
            </div>
            <GenericPopup isOpen={showPopup} onClose={handleClosePopup} title="Transaction Details" step={step}>
                {step === 1 && (
                    <div className="input-container">
                        <div className="input-container-horizontal">
                            <div className="input-wrapper">
                                <label className="input-label">Nickname*</label>
                                <input type="text" className="input-field" onChange={(e) => handleDetailsChange('name', e.target.value)} />
                            </div>
                            <div className="input-wrapper">
                                <label className="input-label">Phone Number*</label>
                                <input type="text" className="input-field" onChange={(e) => handleDetailsChange('phoneNumber', e.target.value)} />
                            </div>
                        </div>
                        {(transactionType === 'membership' || transactionType === 'renewal' || transactionType === 'groupMembership') && (
                            <div className="input-wrapper">
                                <label className="input-label">Email*</label>
                                <input type="email" className="input-field" onChange={(e) => handleDetailsChange('email', e.target.value)} />
                            </div>
                        )}
                    </div>
                )}
                {step === 2 && (
                    <div className="input-container">
                        <div className="radio-wrapper">
                            <label className="radio-label">
                                <input type="radio" name="payment" value="cash" className="radio-input" onChange={handlePaymentChange} /> Cash
                            </label>
                            <label className="radio-label">
                                <input type="radio" name="payment" value="gcash" className="radio-input" onChange={handlePaymentChange} /> GCash
                            </label>
                            <label className="radio-label">
                                <input type="radio" name="payment" value="maya" className="radio-input" onChange={handlePaymentChange} /> Maya
                            </label>
                            <label className="radio-label">
                                <input type="radio" name="payment" value="voucher" className="radio-input" onChange={handlePaymentChange} /> Voucher
                            </label>
                        </div>
                        {paymentMethod === 'cash' && (
                            <>
                                <div className="input-wrapper-horizontal-left">
                                    <label className="input-label-horizontal-left">Receive Amount</label>
                                    <input type="text" className="input-field-horizontal" />
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
                                <input type="text" className="input-field-horizontal" />
                            </div>
                        )}
                        {paymentMethod === 'maya' && (
                            <div className="input-wrapper-horizontal-left">
                                <label className="input-label-horizontal-left">Reference Number</label>
                                <input type="text" className="input-field-horizontal" />
                            </div>
                        )}
                        {paymentMethod === 'voucher' && (
                            <div className="input-wrapper-horizontal-left">
                                <label className="input-label-horizontal-left">Voucher Code</label>
                                <input type="text" className="input-field-horizontal" />
                            </div>
                        )}
                    </div>
                )}
                <div className="button-container">
                    <button onClick={handleClosePopup}>Cancel</button>
                    <button className="continue-button" onClick={handleContinue}>Continue</button>
                </div>
            </GenericPopup>
            {showPaymentDetails && (
                <PaymentDetails 
                    details={details} 
                    onClose={handleClosePaymentDetails} // Use the new handleClosePaymentDetails function
                    onBack={handleBack} // Pass the handleBack function
                    onConfirm={handleContinue} 
                />
            )}
        </div>
    );
};

export default TransactionTypeSelection;
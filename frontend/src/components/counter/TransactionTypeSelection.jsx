import  { useState } from 'react';
import PropTypes from 'prop-types';
import GenericPopup from './GenericPopup';
import WalkInForm from './WalkInForm';
import PaymentMethodForm from './PaymentMethodForm';
import { validateWalkInDetails, submitWalkInTransaction } from '../../utils/walkInLogic';
import '../../css/counter/TransactionTypeSelection.css';
import { PRICES } from '/src/config';

const TransactionTypeSelection = ({ onSelect }) => {
    const [showPopup, setShowPopup] = useState(false);
    const [step, setStep] = useState(1);
    const [transactionType, setTransactionType] = useState('');
    const [details, setDetails] = useState({
        name: '',
        phoneNumber: '',
        email: '',
        paymentMethod: '',
        referenceNumber: '',
        receivedAmount: '',
        change: 0,
        date: new Date().toLocaleDateString(),
        serviceFee: PRICES.WALK_IN // Use the price from config
    });

    const resetState = () => {
        setDetails({
            name: '',
            phoneNumber: '',
            email: '',
            paymentMethod: '',
            referenceNumber: '',
            receivedAmount: '',
            date: new Date().toLocaleDateString(),
            serviceFee: '100'
        });
        setStep(1);
        setTransactionType('');
    };

    const handleClosePopup = () => {
        setShowPopup(false);
        resetState();
    };

    const handleDetailsChange = (field, value) => {
        setDetails(prevDetails => ({
            ...prevDetails,
            [field]: value
        }));
    };

    const handleWalkInClick = () => {
        resetState();
        setShowPopup(true);
        setTransactionType('walkIn');
    };

    const handleMembershipClick = () => {
        resetState();
        setShowPopup(true);
        setTransactionType('membership');
    };

    const handleRenewalClick = () => {
        resetState();
        setShowPopup(true);
        setTransactionType('renewal');
    };

    const handleGroupMembershipClick = () => {
        resetState();
        setShowPopup(true);
        setTransactionType('groupMembership');
    };

    const handleContinue = async () => {
        if (transactionType === 'walkIn') {
            // Validate current step
            const validation = validateWalkInDetails(details, step);
            if (!validation.valid) {
                alert(validation.message);
                return;
            }

            // Move to next step or submit
            if (step < 3) {
                setStep(step + 1);
            } else {
                // Submit transaction
                try {
                    const result = await submitWalkInTransaction(details);
                    if (result.success) {
                        alert('Walk-In transaction successful!');
                        handleClosePopup();
                    } else {
                        alert(`Error: ${result.error}`);
                    }
                } catch (error) {
                    alert('An unexpected error occurred');
                    console.error(error);
                }
            }
        }
        // TODO: Add logic for other transaction types
    };

    const renderFormByStep = () => {
        switch(transactionType) {
            case 'walkIn':
                switch(step) {
                    case 1:
                        return (
                            <WalkInForm 
                                details={details} 
                                onChange={handleDetailsChange} 
                            />
                        );
                    case 2:
                        return (
                            <PaymentMethodForm 
                                details={details} 
                                onChange={handleDetailsChange} 
                            />
                        );
                        case 3:
                            return (
                                <div className="confirmation">
                                    <h3>Confirm Transaction Details</h3>
                                    <div>
                                        <p><strong>Name:</strong> {details.name}</p>
                                        <p><strong>Phone:</strong> {details.phoneNumber}</p>
                                        <p><strong>Email:</strong> {details.email || 'N/A'}</p>
                                        <p><strong>Payment Method:</strong> {details.paymentMethod}</p>
                                        <p><strong>Walk-in Fee:</strong> ₱{PRICES.WALK_IN.toFixed(2)}</p>
                                        {details.paymentMethod === 'Cash' && (
                                            <>
                                                <p><strong>Amount Received:</strong> {details.receivedAmount}</p>
                                                <p><strong>Change:</strong> ₱{details.change}</p>
                                            </>
                                        )}
                                        {details.referenceNumber && (
                                            <p><strong>Reference Number:</strong> {details.referenceNumber}</p>
                                        )}
                                    </div>
                                </div>
                            );
                    default:
                        return null;
                }
            // TODO: Add cases for other transaction types
            default:
                return null;
        }
    };

    return (
        <div className="transaction-type-selection">
            <div className="button-grid-container">
                <div className="button-grid">
                    <button 
                        className="transaction-button" 
                        onClick={handleWalkInClick}
                    >
                        Walk In
                    </button>
                    <button 
                        className="transaction-button" 
                        onClick={handleMembershipClick}
                    >
                        Membership
                    </button>
                    <button 
                        className="transaction-button" 
                        onClick={handleRenewalClick}
                    >
                        Renewal
                    </button>
                    <button 
                        className="transaction-button" 
                        onClick={handleGroupMembershipClick}
                    >
                        Group Membership
                    </button>
                </div>
            </div>

            <GenericPopup 
                isOpen={showPopup} 
                onClose={handleClosePopup} 
                title="Transaction Details" 
                step={step}
            >
                {renderFormByStep()}
                
                <div className="popup-footer">
                    <button onClick={handleContinue}>
                        {step === 3 ? 'Submit' : 'Continue'}
                    </button>
                </div>
            </GenericPopup>
        </div>
    );
};

TransactionTypeSelection.propTypes = {
    onSelect: PropTypes.func
};

TransactionTypeSelection.defaultProps = {
    onSelect: () => {} // No-op function as default
};

export default TransactionTypeSelection;
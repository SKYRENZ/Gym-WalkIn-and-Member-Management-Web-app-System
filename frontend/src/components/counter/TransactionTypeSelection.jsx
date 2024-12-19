import { useState } from 'react';
import PropTypes from 'prop-types';
import GenericPopup from './GenericPopup';
import WalkInForm from './WalkInForm';
import MembershipForm from './MembershipForm';
import PaymentMethodForm from './PaymentMethodForm';
import RenewalForm from './RenewalForm';
import { validateWalkInDetails, submitWalkInTransaction } from '../../utils/walkInLogic';
import { validateMembershipDetails, submitMembershipTransaction } from '../../utils/membershipLogic';
import { validateRenewalDetails, submitRenewalTransaction } from '../../utils/renewalLogic';
import '../../css/counter/TransactionTypeSelection.css';
import { PRICES } from '../../config';

const TransactionTypeSelection = ({ onSelect }) => {
    const [showPopup, setShowPopup] = useState(false);
    const [step, setStep] = useState(1);
    const [transactionType, setTransactionType] = useState('');
    const [error, setError] = useState(null);
    const [details, setDetails] = useState({
        membershipId: null,
        name: '',
        phoneNumber: '',
        email: '',
        paymentMethod: '',
        referenceNumber: '',
        receivedAmount: '',
        change: 0,
        date: new Date().toLocaleDateString(),
        serviceFee: PRICES.WALK_IN
    });

    const resetState = () => {
        setDetails({
            membershipId: null,
            name: '',
            phoneNumber: '',
            email: '',
            paymentMethod: '',
            referenceNumber: '',
            receivedAmount: '',
            change: 0,
            date: new Date().toLocaleDateString(),
            serviceFee: transactionType === 'walkIn' ? PRICES.WALK_IN : 
                        transactionType === 'membership' ? PRICES.NEW_MEMBERSHIP : 
                        PRICES.MEMBERSHIP
        });
        setStep(1);
        setError(null);
    };

    const handleClosePopup = () => {
        setShowPopup(false);
        resetState();
    };

    const handleDetailsChange = (field, value) => {
        setDetails(prevDetails => {
            const newDetails = {
                ...prevDetails,
                [field]: value
            };
            
            // Calculate change for cash payments
            if (field === 'receivedAmount' && newDetails.paymentMethod === 'Cash') {
                const serviceFee = PRICES.MEMBERSHIP;
                const receivedAmount = parseFloat(value) || 0;
                const change = Math.max(0, receivedAmount - serviceFee);
                newDetails.change = change.toFixed(2);
            }
    
            return newDetails;
        });
    };
    const handleWalkInClick = () => {
        resetState();
        setShowPopup(true);
        setTransactionType('walkIn');
        setDetails(prev => ({
            ...prev,
            serviceFee: PRICES.WALK_IN
        }));
    };

    const handleMembershipClick = () => {
        resetState();
        setShowPopup(true);
        setTransactionType('membership');
        setDetails(prev => ({
            ...prev,
            serviceFee: PRICES.NEW_MEMBERSHIP
        }));
    };

    const handleRenewalClick = () => {
        resetState();
        setShowPopup(true);
        setTransactionType('renewal');
        setDetails(prev => ({
            ...prev,
            serviceFee: PRICES.MEMBERSHIP
        }));
    };

    const handleGroupMembershipClick = () => {
        resetState();
        setShowPopup(true);
        setTransactionType('groupMembership');
    };

    const handleContinue = async () => {
        // Validate step based on transaction type
        let isValid = false;
        switch(transactionType) {
            case 'walkIn':
                isValid = validateWalkInDetails(details, step).valid;
                break;
            case 'membership':
                isValid = validateMembershipDetails(details, step).valid;
                break;
            case 'renewal':
                isValid = validateRenewalDetails(details, step).valid;
                break;
            default:
                isValid = false;
        }

        // If validation fails, stop
        if (!isValid) {
            setError('Please complete all required fields');
            return;
        }

        // Move to next step or submit
        if (step === 3) {
            try {
                let result;
                switch(transactionType) {
                    case 'walkIn':
                        result = await submitWalkInTransaction(details);
                        break;
                    case 'membership':
                        result = await submitMembershipTransaction(details);
                        break;
                    case 'renewal':
                        result = await submitRenewalTransaction(details);
                        break;
                    default:
                        throw new Error('Invalid transaction type');
                }
    
                // Handle successful transaction
                if (result.success) {
                    alert(`${transactionType} transaction successful!`);
                    handleClosePopup();
                } else {
                    // More descriptive error message
                    setError(result.error || `Failed to complete ${transactionType} transaction`);
                }
            } catch (err) {
                console.error('Transaction Error:', err);
                setError(`An unexpected error occurred: ${err.message}`);
            }
        } else {
            // Move to next step
            setStep(prev => prev + 1);
            setError(null);
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(prev => prev - 1);
        } else {
            handleClosePopup();
        }
    };
    const renderFormByStep = () => {
        switch(transactionType) {
            case 'walkIn':
                return renderWalkInSteps();
            case 'membership':
                return renderMembershipSteps();
            case 'renewal':
                return renderRenewalSteps();
            default:
                return null;
        }
    };

    const renderWalkInSteps = () => {
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
                        transactionType="walkIn"
                    />
                );
            case 3:
                return renderConfirmationStep(PRICES.WALK_IN);
            default:
                return null;
        }
    };

    const renderMembershipSteps = () => {
        switch(step) {
            case 1:
                return (
                    <MembershipForm 
                        details={details} 
                        onChange={handleDetailsChange} 
                    />
                );
            case 2:
                return (
                    <PaymentMethodForm 
                        details={details} 
                        onChange={handleDetailsChange} 
                        transactionType="membership"
                    />
                );
            case 3:
                return renderConfirmationStep(PRICES.NEW_MEMBERSHIP);
            default:
                return null;
        }
    };

    const renderRenewalSteps = () => {
        switch(step) {
            case 1:
                return (
                    <div>
                        <RenewalForm 
                            onChange={handleDetailsChange} 
                        />
                        {details.membershipId && (
                            <div className="selected-member-details">
                                <h3>Selected Member Details:</h3>
                                <p>Name: {details.name}</p>
                                <p>Email: {details.email}</p>
                                <p>Phone: {details.phoneNumber}</p>
                            </div>
                        )}
                    </div>
                );
            case 2:
                return (
                    <div>
                        <h2>Select Payment Method</h2>
                        <div className="payment-method-container">
                            <div className="radio-wrapper">
                                <label>
                                    <input 
                                        type="radio" 
                                        name="paymentMethod" 
                                        value="Cash"
                                        checked={details.paymentMethod === 'Cash'}
                                        onChange={() => handleDetailsChange('paymentMethod', 'Cash')}
                                    />
                                    Cash
                                </label>
                                <label>
                                    <input 
                                        type="radio" 
                                        name="paymentMethod" 
                                        value="Gcash"
                                        checked={details.paymentMethod === 'Gcash'}
                                        onChange={() => handleDetailsChange('paymentMethod', 'Gcash')}
                                    />
                                    Gcash
                                </label>
                                <label>
                                    <input 
                                        type="radio" 
                                        name="paymentMethod" 
                                        value="Paymaya"
                                        checked={details.paymentMethod === 'Paymaya'}
                                        onChange={() => handleDetailsChange('paymentMethod', 'Paymaya')}
                                    />
                                    Paymaya
                                </label>
                            </div>
            
                            <div className="payment-details-row">
                                <p><strong>Renewal Fee:</strong> ₱{PRICES.MEMBERSHIP.toFixed(2)}</p>
                            </div>
            
                            {details.paymentMethod === 'Cash' && (
                                <div className="payment-details-row">
                                    <label className="payment-details-label">Amount Received</label>
                                    <input 
                                        type="number" 
                                        className="input-field"
                                        value={details.receivedAmount}
                                        onChange={(e) => handleDetailsChange('receivedAmount', e.target.value)}
                                        placeholder="Enter amount received"
                                    />
                                    {details.receivedAmount && (
                                        <div className="payment-details-row">
                                            <p><strong>Change:</strong> ₱{details.change}</p>
                                        </div>
                                    )}
                                </div>
                            )}
            
                            {(details.paymentMethod === 'Gcash' || details.paymentMethod === 'Paymaya') && (
                                <div className="payment-details-row">
                                    <label className="payment-details-label">Reference Number</label>
                                    <input 
                                        type="text" 
                                        className="input-field"
                                        value={details.referenceNumber}
                                        onChange={(e) => handleDetailsChange('referenceNumber', e.target.value)}
                                        placeholder={`Enter ${details.paymentMethod} Reference Number`}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 3:
                return renderConfirmationStep(PRICES.MEMBERSHIP);
            default:
                return null;
        }
    };

    const renderConfirmationStep = (serviceFee) => {
        return (
            <div className="confirmation">
                <div className="details-columns">
                    <div className="details-column">
                        <p><strong>Name:</strong> {details.name}</p>
                        <p><strong>Phone:</strong> {details.phoneNumber}</p>
                        <p><strong>Email:</strong> {details.email || 'N/A'}</p>
                    </div>
                    <div className="details-column">
                        <p><strong>Payment Method:</strong> {details.paymentMethod}</p>
                        <p><strong>Service Fee:</strong> ₱{serviceFee.toFixed(2)}</p>
                    </div>
                </div>
                {details.paymentMethod === 'Cash' && (
                    <div className="details-columns">
                        <div className="details-column">
                            <p><strong>Amount Received:</strong> ₱{details.receivedAmount}</p>
                        </div>
                        <div className="details-column">
                            <p><strong>Change:</strong> ₱{details.change}</p>
                        </div>
                    </div>
                )}
                {details.referenceNumber && (
                    <p><strong>Reference Number:</strong> {details.referenceNumber}</p>
                )}
            </div>
        );
    };

    return (
        <div className="transaction-type-selection">
            {!showPopup && (
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
                            disabled
                            onClick={handleGroupMembershipClick}
                        >
                            Group Membership
                        </button>
                    </div>
                </div>
            )}

            {showPopup && (
                <GenericPopup 
                    isOpen={showPopup} 
                    onClose={handleClosePopup} 
                    title={`${
                        transactionType === 'walkIn' ? 'Walk-In' : 
                        transactionType === 'membership' ? 'Membership' : 
                        transactionType === 'renewal' ? 'Membership Renewal' : 
                        'Transaction'
                    } Transaction`} 
                    step={step}
                    onBack={handleBack}
                >
                    {renderFormByStep()}
                    
                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <div className="popup-footer">
                        <button 
                            onClick={handleContinue}
                            disabled={
                                (transactionType === 'renewal' && step === 1 && !details.membershipId) ||
                                (step === 2 && !details.paymentMethod)
                            }
                        >
                            {step === 3 ? 'Submit' : 'Continue'}
                        </button>
                    </div>
                </GenericPopup>
            )}
        </div>
    );
};

TransactionTypeSelection.propTypes = {
    onSelect: PropTypes.func
};

TransactionTypeSelection.defaultProps = {
    onSelect: () => {} 
};

export default TransactionTypeSelection;
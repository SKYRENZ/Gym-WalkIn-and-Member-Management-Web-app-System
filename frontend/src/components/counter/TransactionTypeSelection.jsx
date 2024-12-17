import { useState } from 'react';
import PropTypes from 'prop-types';
import GenericPopup from './GenericPopup';
import WalkInForm from './WalkInForm';
import MembershipForm from './MembershipForm';
import PaymentMethodForm from './PaymentMethodForm';
import { validateWalkInDetails, submitWalkInTransaction } from '../../utils/walkInLogic';
import { validateMembershipDetails, submitMembershipTransaction } from '../../utils/membershipLogic';
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
        serviceFee: PRICES.WALK_IN
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
            serviceFee: transactionType === 'walkIn' ? PRICES.WALK_IN : PRICES.NEW_MEMBERSHIP
        });
        setStep(1);
        setTransactionType('');
    };

    const handleClosePopup = () => {
        setShowPopup(false);
        resetState();
    };

    const handleDetailsChange = (field, value) => {
        console.log(`Changing ${field} to:`, value);
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
        let validation, submissionResult;

        // Determine validation and submission based on transaction type
        if (transactionType === 'walkIn') {
            validation = validateWalkInDetails(details, step);
            if (!validation.valid) {
                alert(validation.message);
                return;
            }

            if (step < 3) {
                setStep(step + 1);
                return;
            }

            submissionResult = await submitWalkInTransaction(details);
        } else if (transactionType === 'membership') {
            validation = validateMembershipDetails(details, step);
            if (!validation.valid) {
                alert(validation.message);
                return;
            }

            if (step < 3) {
                setStep(step + 1);
                return;
            }

            submissionResult = await submitMembershipTransaction(details);
        }

        // Handle submission result
        if (submissionResult.success) {
            alert(`${transactionType === 'walkIn' ? 'Walk-In' : 'Membership'} transaction successful!`);
            handleClosePopup();
        } else {
            alert(`Error: ${submissionResult.error}`);
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        } else {
            handleClosePopup();
        }
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
                                <div className="details-columns">
                                    <div className="details-column">
                                        <p><strong>Name:</strong> {details.name}</p>
                                        <p><strong>Phone:</strong> {details.phoneNumber}</p>
                                        <p><strong>Email:</strong> {details.email || 'N/A'}</p>
                                    </div>
                                    <div className="details-column">
                                        <p><strong>Payment Method:</strong> {details.paymentMethod}</p>
                                        <p><strong>Walk-in Fee:</strong> ₱{PRICES.WALK_IN.toFixed(2)}</p>
                                    </div>
                                </div>
                                {details.paymentMethod === 'Cash' && (
                                    <div className="details-columns">
                                        <div className="details-column">
                                            <p><strong>Amount Received:</strong> {details.receivedAmount}</p>
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
                    default:
                        return null;
                }
            case 'membership':
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
                        return (
                            <div className="confirmation">
                                <div className="details-columns">
                                    <div className="details-column">
                                        <p><strong>Name:</strong> {details.name}</p>
                                        <p><strong>Phone:</strong> {details.phoneNumber}</p>
                                        <p><strong>Email:</strong> {details.email}</p>
                                    </div>
                                    <div className="details-column">
                                        <p><strong>Payment Method:</strong> {details.paymentMethod}</p>
                                        <p><strong>Membership Fee:</strong> ₱{PRICES.NEW_MEMBERSHIP.toFixed(2)}</p>
                                    </div>
                                </div>
                                {details.paymentMethod === 'Cash' && (
                                    <div className="details-columns">
                                        <div className="details-column">
                                            <p><strong>Amount Received:</strong> {details.receivedAmount}</p>
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
                    default:
                        return null;
                }
            default:
                return null;
        }
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
                    title={`${transactionType === 'walkIn' ? 'Walk-In' : 'Membership'} Transaction`} 
                    step={step}
                    onBack={handleBack}
                >
                    {renderFormByStep()}
                    
                    <div className="popup-footer">
                        <button onClick={handleContinue}>
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

// Provide a default no-op function
TransactionTypeSelection.defaultProps = {
    onSelect: () => {} // Empty function as default
};

export default TransactionTypeSelection;
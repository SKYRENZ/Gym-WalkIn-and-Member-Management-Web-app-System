import React from 'react';
import { FaArrowLeft } from 'react-icons/fa'; // Importing an icon from react-icons
import '../../css/counter/PaymentDetails.css'; // Importing the new CSS file

const PaymentDetails = ({ 
    details, 
    onClose, 
    onBack, // New prop for handling back button click
    onConfirm 
}) => {
    return (
        <div className="payment-modal-overlay">
            <div className="payment-modal-content">
                <div className="payment-modal-header">
                    <button className="payment-back-button" onClick={onBack}>
                        <FaArrowLeft />
                    </button>
                    <h2 className="payment-modal-title">Transaction Details</h2>
                </div>
                <div className="payment-indicator-container">
                    <div className="payment-indicator active"></div>
                </div>
                <div className="payment-tabs">
                    <div className="payment-tab active">Payment Details</div>
                </div>
                <div className="payment-modal-body">
                    <div className="payment-details-container">
                        <div className="payment-details-column">
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
                        <div className="payment-details-column">
                            <div className="payment-details-row">
                                <label className="payment-details-label">Payment Method:</label>
                                <span className="payment-details-value">{details.paymentMethod || 'Payment Method'}</span>
                            </div>
                            <div className="payment-details-row">
                                <label className="payment-details-label">Transaction Type:</label>
                                <span className="payment-details-value">{details.transactionType || 'Transaction Type'}</span>
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
                <div className="payment-modal-footer">
                    <button className="payment-cancel-button" onClick={onClose}>Cancel</button>
                    <button className="payment-confirm-button" onClick={onConfirm}>Confirm</button>
                </div>
            </div>
        </div>
    );
};

export default PaymentDetails;
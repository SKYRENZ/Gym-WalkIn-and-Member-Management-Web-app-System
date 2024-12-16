import React from 'react';
import '../../css/counter/GenericPopup.css';
import BackIcon from '../../assets/Back.png'; // Importing the back icon

const GenericPopup = ({ isOpen, onClose, title, children, step, onBack }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="popup-header">
                    <button className="back-button" onClick={onBack || onClose}>
                        <img src={BackIcon} alt="Back Icon" />
                    </button>
                    <h2 className="popup-title">{title}</h2>
                </div>
                <div className="indicator-container">
                    <div className="indicator-wrapper">
                        <div className={`indicator ${step === 1 ? 'active' : ''}`}></div>
                        {step === 1 && <div className="indicator-label">Customer Information</div>}
                    </div>
                    <div className="indicator-wrapper">
                        <div className={`indicator ${step === 2 ? 'active' : ''}`}></div>
                        {step === 2 && <div className="indicator-label">Payment Information</div>}
                    </div>
                    <div className="indicator-wrapper">
                        <div className={`indicator ${step === 3 ? 'active' : ''}`}></div>
                        {step === 3 && <div className="indicator-label">Payment Details</div>}
                    </div>
                </div>
                <hr className="divider" />
                <div className="popup-content">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default GenericPopup;
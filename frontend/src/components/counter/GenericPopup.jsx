import React from 'react';
import '../../css/counter/GenericPopup.css';
import { FaArrowLeft } from 'react-icons/fa';

const GenericPopup = ({ isOpen, onClose, title, children, step }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="popup-header">
                    <button className="back-button" onClick={onClose}>
                        <FaArrowLeft />
                    </button>
                    <h2 className="popup-title">{title}</h2>
                </div>
                <div className="indicator-container">
                    <div className={`indicator ${step === 1 ? 'active' : ''}`}></div>
                    <div className={`indicator ${step === 2 ? 'active' : ''}`}></div>
                </div>
                {step === 1 && <div className="indicator-label">Customer Information</div>}
                {step === 2 && <div className="indicator-label">Payment Information</div>}
                <hr className="divider" />
                <div className="popup-content">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default GenericPopup;
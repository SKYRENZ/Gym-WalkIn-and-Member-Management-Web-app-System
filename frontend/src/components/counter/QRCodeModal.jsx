import React from 'react';
import '../css/counter/QRCodeModal.css';

function QRCodeModal({ onClose }) {
    return (
        <div className="modalOverlay">
            <div className="modalContent">
                <span className="closeButton" onClick={onClose}>&times;</span>
                <h2>QR Code Scanner</h2>
                {/* QR Code Scanner Component or Implementation */}
            </div>
        </div>
    );
}

export default QRCodeModal;
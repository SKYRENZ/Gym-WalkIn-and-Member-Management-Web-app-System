import React, { useState } from 'react';
import Modal from 'react-modal';
import QrScanner from 'react-qr-scanner';
import '/src/css/counter/QRCodeModal.css';

Modal.setAppElement('#root'); // Set the root element for accessibility

function QRCodeModal({ isOpen, onClose = () => {} }) {
    const [scanResult, setScanResult] = useState(null);

    const handleScan = (data) => {
        if (data && data.text !== scanResult) {
            setScanResult(data.text || data); 
            console.log('Scan Result:', data);
            onClose(); 
        }
    };

    const handleError = (err) => {
        console.error('QR Scanner Error:', err);
    };

    const previewStyle = {
        height: 300,
        width: 300,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            contentLabel="QR Code Scanner"
            className="modalContent"
            overlayClassName="modalOverlay"
        >
            <span className="closeButton" onClick={onClose}>&times;</span>
            <h2 style={{ color: 'black' }}>QR Code Scanner</h2>
            <div style={previewStyle} className="qr-scanner-container">
                <QrScanner
                    delay={300}
                    style={{ width: '100%', height: '100%' }}
                    onError={handleError}
                    onScan={handleScan}
                />
            </div>
            {scanResult && <p style={{ color: 'black' }}>Scanned Result: {JSON.stringify(scanResult)}</p>}
        </Modal>
    );
}

export default QRCodeModal;

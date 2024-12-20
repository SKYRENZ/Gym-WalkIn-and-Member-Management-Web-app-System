import React, { useState } from 'react';
import Modal from 'react-modal';
import QrScanner from 'react-qr-scanner';
import CheckInInfoModal from './CheckInInfoModal';
import '../../css/counter/QRCodeModal.css';

Modal.setAppElement('#root'); // Set the root element for accessibility

function QRCodeModal({ isOpen, onClose, onCheckInSuccess }) {
    const [scanResult, setScanResult] = useState(null);
    const [customerDetails, setCustomerDetails] = useState(null);
    const [isCheckInInfoModalOpen, setIsCheckInInfoModalOpen] = useState(false);

    const handleScan = async (data) => {
        if (data) {
            setScanResult(data.text || data);
            console.log('Scan Result:', data);

            try {
                const response = await fetch('http://localhost:3000/scan-qr', { // Update the URL to match your backend server
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ qrCodeValue: data.text || data }),
                });

                const result = await response.json();
                if (result.success) {
                    const startDate = new Date(result.customerDetails.start_date).toLocaleDateString();
                    const endDate = new Date(result.customerDetails.end_date).toLocaleDateString();
                    console.log(`Customer Details:
Name: ${result.customerDetails.name}
Email: ${result.customerDetails.email}
Contact Info: ${result.customerDetails.contact_info}
Start Date: ${startDate}
End Date: ${endDate}`);
                    setCustomerDetails(result.customerDetails);
                    setIsCheckInInfoModalOpen(true); // Open the CheckInInfoModal
                } else {
                    if (result.error === 'Membership is not valid at the current time') {
                        console.log('Membership Expired');
                    } else if (result.error === 'Check-in already recorded for today') {
                        console.log('Check-in already recorded for today');
                    } else {
                        console.error('Error fetching customer details:', result.error);
                    }
                }
            } catch (error) {
                console.error('Error:', error);
            }

            onClose();
        }
    };

    const handleError = (err) => {
        console.error('QR Scanner Error:', err);
    };

    const handleCheckInInfoModalClose = () => {
        setIsCheckInInfoModalOpen(false);
    };

    const handleCheckInSuccess = () => {
        onCheckInSuccess();
        setIsCheckInInfoModalOpen(false);
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
        <>
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
            </Modal>
            <CheckInInfoModal
                isOpen={isCheckInInfoModalOpen}
                onClose={handleCheckInInfoModalClose}
                customerDetails={customerDetails}
                onCheckInSuccess={handleCheckInSuccess} // Pass the onCheckInSuccess prop
            />
        </>
    );
}

export default QRCodeModal;
// src/pages/Counter.jsx
import React, { useState } from 'react';
import CounterHeader from '../components/counter/CounterHeader.jsx';
import SummaryCards from '../components/counter/SummaryCards.jsx';
import TopBar from '../components/counter/TopBar.jsx';
import MainTransaction from '../components/counter/MainTransaction.jsx';
import QRCodeModal from '../components/counter/QRCodeModal.jsx';
import GenericPopup from '../components/counter/GenericPopup.jsx'; // Import the GenericPopup component
import TransactionTypeSelection from '../components/counter/TransactionTypeSelection.jsx'; // Import the transaction type selection component
import '../css/counter/Counter.css';
import '../css/counter/TransactionTypeSelection.css'; // Import the CSS for transaction type selection

function Counter() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [checkinCount, setCheckinCount] = useState(0);
    const [customerDetails, setCustomerDetails] = useState(null);

    const fetchCheckinCount = async () => {
        try {
            const response = await fetch('http://localhost:3000/checkin-count');
            const result = await response.json();
            setCheckinCount(result.count);
        } catch (error) {
            console.error('Error fetching check-in count:', error);
        }
    };

    useEffect(() => {
        fetchCheckinCount();
    }, []);

    const handleCheckInClick = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleNewTransactionClick = () => {
        setIsGenericPopupOpen(true); // Open the generic popup for transaction type selection
    };

    const handleCloseGenericPopup = () => {
        setIsGenericPopupOpen(false); // Close the generic popup
    };

    const handleBackButtonClick = () => {
        setIsGenericPopupOpen(false); // Close the generic popup when back is clicked
    };

    const handleTransactionTypeSelect = (type) => {
        console.log(`Selected transaction type: ${type}`);
        if (type === 'walkIn') {
            setIsWalkInDetailsOpen(true); // Open the Walk In details popup
        }
        setIsGenericPopupOpen(false); // Close the generic popup
    };

    const handleCloseWalkInDetails = () => {
        setIsWalkInDetailsOpen(false); // Close the Walk In details popup
    const handleCheckInSuccess = () => {
        fetchCheckinCount();
        setIsModalOpen(false);
    };

    return (
        <>
            <CounterHeader />
            <div className="counterContainer">
                <div className="top">
                    <TopBar 
                        onCheckInClick={handleCheckInClick} 
                        onNewTransactionClick={handleNewTransactionClick} // Pass the handler
                    />
                    <SummaryCards />
                    {/* Add the Walk In button here */}
                    <TopBar onCheckInClick={handleCheckInClick} />
                    <SummaryCards checkinCount={checkinCount} />
                </div>
                <div className="bottom">
                    <MainTransaction />
                </div>
            </div>
            <QRCodeModal isOpen={isModalOpen} onClose={handleCloseModal} />
            
            {/* Generic Popup for Transaction Type Selection */}
            <GenericPopup 
                isOpen={isGenericPopupOpen} 
                onClose={handleCloseGenericPopup} 
                onBack={handleBackButtonClick} // Pass the back button handler
                title="Transaction Type" // Title for the transaction type selection
            >
                <TransactionTypeSelection onSelect={handleTransactionTypeSelect} />
            </GenericPopup>

            
            <QRCodeModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onCheckInSuccess={handleCheckInSuccess} // Pass the onCheckInSuccess function
            />
        </>
    );
}

export default Counter;
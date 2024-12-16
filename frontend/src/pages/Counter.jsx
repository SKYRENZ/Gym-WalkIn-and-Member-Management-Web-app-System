// src/pages/Counter.jsx
import  { useState, useEffect } from 'react';
import CounterHeader from '../components/counter/CounterHeader.jsx';
import SummaryCards from '../components/counter/SummaryCards.jsx';
import TopBar from '../components/counter/TopBar.jsx';
import MainTransaction from '../components/counter/MainTransaction.jsx';
import QRCodeModal from '../components/counter/QRCodeModal.jsx';
import GenericPopup from '../components/counter/GenericPopup.jsx';
import TransactionTypeSelection from '../components/counter/TransactionTypeSelection.jsx';
import '../css/counter/Counter.css';
import '../css/counter/TransactionTypeSelection.css';

function Counter() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [checkinCount, setCheckinCount] = useState(0);
    const [isGenericPopupOpen, setIsGenericPopupOpen] = useState(false);

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
        setIsGenericPopupOpen(true);
    };

    const handleCloseGenericPopup = () => {
        setIsGenericPopupOpen(false);
    };

    const handleBackButtonClick = () => {
        setIsGenericPopupOpen(false);
    };

    const handleTransactionTypeSelect = (type) => {
        console.log(`Selected transaction type: ${type}`);
        setIsGenericPopupOpen(false);
    };

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
                        onNewTransactionClick={handleNewTransactionClick}
                    />
                    <SummaryCards checkinCount={checkinCount} />
                </div>
                <div className="bottom">
                    <MainTransaction />
                </div>
            </div>
            <QRCodeModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onCheckInSuccess={handleCheckInSuccess}
            />
            
            <GenericPopup 
                isOpen={isGenericPopupOpen} 
                onClose={handleCloseGenericPopup} 
                onBack={handleBackButtonClick}
                title="Transaction Type"
            >
                <TransactionTypeSelection onSelect={handleTransactionTypeSelect} />
            </GenericPopup>
        </>
    );
}

export default Counter;
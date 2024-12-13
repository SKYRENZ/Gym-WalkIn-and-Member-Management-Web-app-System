import React, { useState } from 'react';
import CounterHeader from '../components/counter/CounterHeader.jsx';
import SummaryCards from '../components/counter/SummaryCards.jsx';
import TopBar from '../components/counter/TopBar.jsx';
import MainTransaction from '../components/counter/MainTransaction.jsx';
import QRCodeModal from '../components/counter/QRCodeModal.jsx';
import '../css/counter/Counter.css';

function Counter() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleCheckInClick = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    return (
        <>
            <CounterHeader />
            <div className="counterContainer">
                <div className="top">
                    <TopBar />
                    <SummaryCards />
                </div>
                <div className="bottom">
                    <MainTransaction />
                </div>
            </div>
            <button onClick={handleCheckInClick}>Check In</button>
            {isModalOpen && <QRCodeModal onClose={handleCloseModal} />}
        </>
    );
}

export default Counter;
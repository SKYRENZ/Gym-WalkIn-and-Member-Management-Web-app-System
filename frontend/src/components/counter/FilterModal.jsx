import React, { useState } from 'react';
import Modal from 'react-modal';
import '../../css/counter/FilterModal.css';

const FilterModal = ({ isOpen, onClose, onApply }) => {
    const [transactionType, setTransactionType] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');

    const handleApply = () => {
        onApply({ transactionType, paymentMethod });
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            className="filter-modal-content"
            overlayClassName="filter-modal-overlay"
        >
            <h2 className="filter-h2">Filter Transactions</h2>
            <div className="filter-group">
                <label htmlFor="transactionType">Transaction Type</label>
                <select
                    id="transactionType"
                    value={transactionType}
                    onChange={(e) => setTransactionType(e.target.value)}
                >
                    <option value="">All</option>
                    <option value="new membership">New Membership</option>
                    <option value="membership renewal">Membership Renewal</option>
                    <option value="walkin">Walk-In Transaction</option>
                </select>
            </div>
            <div className="filter-group">
                <label htmlFor="paymentMethod">Mode of Payment</label>
                <select
                    id="paymentMethod"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                >
                    <option value="">All</option>
                    <option value="gcash">Gcash</option>
                    <option value="cash">Cash</option>
                    <option value="paymaya">Paymaya</option>
                </select>
            </div>
            <button onClick={handleApply} className="apply-button">Apply</button>
        </Modal>
    );
};

export default FilterModal;
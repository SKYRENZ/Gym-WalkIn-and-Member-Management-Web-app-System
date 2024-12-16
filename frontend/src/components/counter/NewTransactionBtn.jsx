// src/components/NewTransactionBtn.jsx
import React from 'react';
import '../../css/counter/NewTransactionBtn.css';

const NewTransactionBtn = ({ onClick }) => {
    return (
        <button className="newTransactionButton" onClick={onClick}>
            + New Transaction
        </button>
    );
};

export default NewTransactionBtn;
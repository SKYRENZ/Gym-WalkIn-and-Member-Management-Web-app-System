import React, { useState, useEffect } from 'react';
import api from '../../api'; // Ensure you have an api utility
import '../../css/counter/TransactionTable.css';

function TransactionsTable({ searchTerm }) {
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTransactionLogs = async () => {
            try {
                setIsLoading(true);
                const response = await api.get('/getTransactionLogs');
                
                if (response.data.success) {
                    setTransactions(response.data.data);
                } else {
                    throw new Error('Failed to fetch transaction logs');
                }
            } catch (err) {
                console.error('Error fetching transaction logs:', err);
                setError('Failed to load transaction logs');
            } finally {
                setIsLoading(false);
            }
        };

        fetchTransactionLogs();
    }, []);

    const filteredTransactions = transactions.filter(transaction =>
        transaction.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="transactions-table-container">
                <p>Loading transactions...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="transactions-table-container">
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="transactions-table-container">
            <table className="transactions-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Mode of Payment</th>
                        <th>Transaction Date</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredTransactions.map((transaction, index) => (
                        <tr key={index}>
                            <td>{transaction.name}</td>
                            <td>{transaction.transaction_type}</td>
                            <td>{transaction.payment_method}</td>
                            <td>{transaction.transaction_date}</td>
                            <td>₱{transaction.amount}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default TransactionsTable;
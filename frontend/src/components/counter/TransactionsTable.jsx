import React from 'react';
import "../../csscounter/TransactionsTable.css";



const TransactionsTable = () => {
    const transactions = [
        { id: "1126240001", name: "Juan Dela Cruz", type: "Walk In", payment: "Paymaya", date: "November 26, 2024", amount: "₱60.00" },
        // Add more transactions here
    ];

    return (
        <div className="transactions">
            <table>
                <thead>
                    <tr>
                        <th>Transaction ID</th>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Mode of Payment</th>
                        <th>Transaction Date</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map((transaction, index) => (
                        <tr key={index}>
                            <td>{transaction.id}</td>
                            <td>{transaction.name}</td>
                            <td>{transaction.type}</td>
                            <td>{transaction.payment}</td>
                            <td>{transaction.date}</td>
                            <td>{transaction.amount}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TransactionsTable;

import React from 'react';

const Transactions = () => {
    const transactions = [
        { id: '1126240001', name: 'Juan Dela Cruz', type: 'Walk In', payment: 'Paymaya', date: 'November 26, 2024', amount: '₱60.00' },
        // Add more transactions here for demonstration.
    ];

    const handleSearch = () => {
        alert('Search functionality coming soon!');
    };

    const handleFilter = () => {
        alert('Filter functionality coming soon!');
    };

    return (
        <div style={{ padding: '0 40px' }}>
            {/* Transactions Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
                <h2 style={{ margin: '0', fontSize: '24px', fontWeight: 'bold', color: '#333' }}>Transactions</h2>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {/* Search Box */}
                    <input
                        type="text"
                        placeholder="Search..."
                        style={{
                            height: '30px',
                            borderRadius: '4px',
                            border: '1px solid #ddd',
                            padding: '0 10px',
                            fontSize: '14px',
                            width: '200px',
                        }}
                    />
                    {/* Filter Button */}
                    <button
                        onClick={handleFilter}
                        style={{
                            height: '30px',
                            backgroundColor: '#5ED5A8',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '0 15px',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                        }}
                    >
                        Filter
                    </button>
                </div>
            </div>

            {/* Transactions Table in a Box */}
            <div
                style={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '20px',
                    backgroundColor: '#f9f9f9',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                }}
            >
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f1f1f1' }}>
                            <th style={tableHeaderStyle}>Transaction ID</th>
                            <th style={tableHeaderStyle}>Name</th>
                            <th style={tableHeaderStyle}>Type</th>
                            <th style={tableHeaderStyle}>Mode of Payment</th>
                            <th style={tableHeaderStyle}>Transaction Date</th>
                            <th style={tableHeaderStyleRight}>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((transaction, index) => (
                            <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                                <td style={tableCellStyle}>{transaction.id}</td>
                                <td style={tableCellStyle}>{transaction.name}</td>
                                <td style={tableCellStyle}>{transaction.type}</td>
                                <td style={tableCellStyle}>{transaction.payment}</td>
                                <td style={tableCellStyle}>{transaction.date}</td>
                                <td style={tableCellStyleRight}>{transaction.amount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Common styles for table headers and cells
const tableHeaderStyle = {
    textAlign: 'left',
    padding: '10px',
    fontWeight: 'bold',
    color: '#555',
    borderBottom: '2px solid #ddd',
};

const tableHeaderStyleRight = {
    textAlign: 'right',
    padding: '10px',
    fontWeight: 'bold',
    color: '#555',
    borderBottom: '2px solid #ddd',
};

const tableCellStyle = {
    textAlign: 'left',  // Left align for all non-numeric values
    padding: '8px',
    color: '#333',
};

const tableCellStyleRight = {
    textAlign: 'right',  // Right align for numeric values like Amount
    padding: '8px',
    color: '#333',
};

export default Transactions;
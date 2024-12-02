import React, { useState } from 'react';
import Header from './Components/Header';
import Overview from './Components/Overview';
import Transactions from './Components/Transactions';

function App() {
    const [dropdownVisible, setDropdownVisible] = useState(false);

    const toggleDropdown = () => {
        setDropdownVisible(!dropdownVisible);
    };

    return (
        <div style={{ fontFamily: 'Arial, sans-serif' }}>
            {/* Cavin Fitness and Receptionist Header */}
            <div style={headerContainerStyle}>
                <h1 style={headerTextStyle}>Cavin Fitness</h1>
                <div style={receptionistTextContainer}>
                    <p style={receptionistTextStyle}>Renz - Receptionist</p>
                    <button onClick={toggleDropdown} style={dropdownButtonStyle}>▼</button>

                    {/* Dropdown Menu */}
                    {dropdownVisible && (
                        <div style={dropdownMenuStyle}>
                            <p style={dropdownItemStyle}>Profile</p>
                            <p style={dropdownItemStyle}>Settings</p>
                            <p style={dropdownItemStyle}>Logout</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Overview Text and Buttons */}
            <div style={overviewHeaderStyle}>
                <h2 style={overviewTextStyle}>Overview</h2>
                <div style={buttonGroupStyle}>
                    <button style={checkInButtonStyle}>Check In</button>
                    <button style={newTransactionButtonStyle}>+ New Transaction</button>
                </div>
            </div>

            {/* Overview Section */}
            <Overview />

            {/* Transactions Section */}
            <Transactions />
        </div>
    );
}

// Styles
const headerContainerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 20px',
    borderBottom: '2px solid #ddd',
    marginBottom: '10px',
};

const headerTextStyle = {
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '0',
};

const receptionistTextContainer = {
    display: 'flex',
    alignItems: 'center',
};

const receptionistTextStyle = {
    fontSize: '14px',
    color: '#555',
    margin: '0',
    marginRight: '10px',
};

const dropdownButtonStyle = {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
    padding: '5px',
};

const dropdownMenuStyle = {
    position: 'absolute',
    top: '40px',
    right: '20px',
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
    zIndex: '10',
    minWidth: '120px',
};

const dropdownItemStyle = {
    padding: '10px',
    borderBottom: '1px solid #ddd',
    cursor: 'pointer',
};

const overviewHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 20px',
    margin: '20px 0',
};

const overviewTextStyle = {
    fontSize: '28px', // Increased font size for better emphasis
    fontWeight: 'bold',
    color: '#333',
    margin: '0',
};

const buttonGroupStyle = {
    display: 'flex',
    gap: '10px', // Adds spacing between buttons
};

const checkInButtonStyle = {
    backgroundColor: '#007bff', // Blue for Check In
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    textAlign: 'center',
};

const newTransactionButtonStyle = {
    backgroundColor: '#5cb85c', // Green for + New Transaction
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    textAlign: 'center',
};

// Adjusted table styles
const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px',
};

const tableHeaderStyle = {
    backgroundColor: '#f4f4f4',
    fontWeight: 'bold',
    fontSize: '16px',
    borderBottom: '2px solid #ddd',
};

const tableCellStyle = {
    padding: '12px 20px',
    borderBottom: '1px solid #ddd',
    textAlign: 'left',
};

const tableRowStyle = {
    backgroundColor: '#fff',
};

const tableRowHoverStyle = {
    backgroundColor: '#f9f9f9',
};

export default App;
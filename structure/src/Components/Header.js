import React from 'react';

const Header = () => {
    const handleDropdown = () => {
        alert('Dropdown menu clicked!');
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ margin: 0 }}>Cavin Fitness</h1>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <button style={{ marginRight: '15px', padding: '10px', borderRadius: '5px', backgroundColor: '#5C9CF2', color: 'white', border: 'none' }}>
                    Check In
                </button>
                <button style={{ marginRight: '15px', padding: '10px', borderRadius: '5px', backgroundColor: '#5ED5A8', color: 'white', border: 'none' }}>
                    + New Transaction
                </button>
                <div>
                    <button onClick={handleDropdown} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        Renz - Receptionist ▼
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Header;
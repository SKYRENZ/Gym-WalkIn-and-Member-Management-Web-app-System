import React from 'react';

const Overview = () => {
    const metrics = [
        { label: 'Walked In', value: 20, icon: '🚶‍♂️' },
        { label: 'Checked-In', value: 13, icon: '📋' },
        { label: 'New Members', value: 18, icon: '👤' },
        { label: 'Voucher Codes', value: 4, icon: '🎟️' }
    ];

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '1rem',
            gap: '1rem',
            flexWrap: 'wrap', 
        }}>
            {metrics.map((metric, index) => (
                <div key={index} style={{
                    flex: '1',
                    backgroundColor: '#e7f3ff',
                    padding: '1.5rem',
                    borderRadius: '10px',
                    textAlign: 'left',
                    position: 'relative',
                    minWidth: '220px', 
                    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', 
                    marginBottom: '1rem', 
                }}>
                    <h3 style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#333',
                        margin: '0 0 8px 0'
                    }}>{metric.label}</h3>
                    <p style={{
                        fontSize: '32px',
                        fontWeight: 'bold',
                        color: '#007bff',
                        margin: '0 0 8px 0',
                    }}>
                        {metric.value}
                    </p>
                    <span style={{
                        position: 'absolute',
                        bottom: '10px',
                        right: '10px',
                        fontSize: '35px',
                        opacity: 0.8, 
                    }}>
                        {metric.icon}
                    </span>
                </div>
            ))}
        </div>
    );
};

export default Overview;
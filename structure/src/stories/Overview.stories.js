import React from 'react';

const Overview = () => {
    return (
        <div>
            <h2>Overview</h2>
            <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '20px' }}>
                <div style={{ backgroundColor: '#F0F9FF', padding: '20px', borderRadius: '10px', width: '20%', textAlign: 'center' }}>
                    <p>Walked In</p>
                    <h3>20</h3>
                </div>
                <div style={{ backgroundColor: '#F0F9FF', padding: '20px', borderRadius: '10px', width: '20%', textAlign: 'center' }}>
                    <p>Checked-In</p>
                    <h3>13</h3>
                </div>
                <div style={{ backgroundColor: '#F0F9FF', padding: '20px', borderRadius: '10px', width: '20%', textAlign: 'center' }}>
                    <p>New Members</p>
                    <h3>18</h3>
                </div>
                <div style={{ backgroundColor: '#FDF5F5', padding: '20px', borderRadius: '10px', width: '20%', textAlign: 'center' }}>
                    <p>Voucher Codes</p>
                    <h3>4</h3>
                </div>
            </div>
        </div>
    );
};

export default Overview;
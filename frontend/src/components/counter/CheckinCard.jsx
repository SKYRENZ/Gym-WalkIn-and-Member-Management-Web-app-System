import React, { useState, useEffect } from 'react';
import checkInIcon from '../../assets/check-in icon.svg';

function CheckedInCard() {
    const [checkinCount, setCheckinCount] = useState(0);

    useEffect(() => {
        const fetchCheckinCount = async () => {
            try {
                const response = await fetch('http://localhost:3000/checkin-count');
                const data = await response.json();
                setCheckinCount(data.count);
            } catch (error) {
                console.error('Error fetching check-in count:', error);
            }
        };

        fetchCheckinCount();
    }, []);

    return (
        <div className="card checked-in">
            <h3>Checked-In</h3>
            <p>Check-in Entries</p>
            <div className="number">{checkinCount}</div>
            <div className="icon">
                <img src={checkInIcon} alt="Check-in Icon" />
            </div>
        </div>
    );
}

export default CheckedInCard;
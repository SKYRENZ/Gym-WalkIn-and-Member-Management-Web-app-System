import { useState, useEffect } from 'react';
import walkInIcon from '../../assets/walk-in icon.svg';

function WalkedInCard() {
    const [walkInCount, setWalkInCount] = useState(0);

    const fetchWalkInCount = async () => {
        try {
            const response = await fetch('http://localhost:3000/today-walkin-count');
            const result = await response.json();
            setWalkInCount(result.count);
        } catch (error) {
            console.error('Error fetching walk-in count:', error);
            setWalkInCount(0);
        }
    };

    useEffect(() => {
        // Fetch initial count
        fetchWalkInCount();

        // Set up interval to refresh count every minute
        const intervalId = setInterval(fetchWalkInCount, 60000);

        // Cleanup interval on component unmount
        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="summary-card walked-in">
            <h3>Walked In</h3>
            <p>Walk-in Entries</p>
            <div className="number">{walkInCount}</div>
            <div className="icon">
                <img src={walkInIcon} alt="Walk-in Icon" />
            </div>
        </div>
    );
}

export default WalkedInCard;
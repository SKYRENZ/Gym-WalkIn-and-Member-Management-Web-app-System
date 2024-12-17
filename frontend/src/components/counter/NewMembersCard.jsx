import { useState, useEffect } from 'react';
import newMemberIcon from '../../assets/new member icon.svg';
import axios from 'axios';

function NewMembersCard() {
    const [newMembersCount, setNewMembersCount] = useState(0);

    const fetchNewMembers = async () => {
        try {
            // Calculate the date 7 days ago
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const response = await axios.get('http://localhost:3000/getNewMembers', {
                params: {
                    startDate: sevenDaysAgo.toISOString().split('T')[0]
                }
            });

            setNewMembersCount(response.data.count);
        } catch (error) {
            console.error('Error fetching new members:', error);
            setNewMembersCount(0);
        }
    };

    useEffect(() => {
        // Fetch initial count
        fetchNewMembers();

        // Set up interval to refresh count every hour
        const intervalId = setInterval(fetchNewMembers, 3600000);

        // Cleanup interval on component unmount
        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="card new-members">
            <h3>New Members</h3>
            <p>Recently Registered Members</p>
            <div className="number">{newMembersCount}</div>
            <div className="icon">
                <img src={newMemberIcon} alt="New Member Icon" />
            </div>
        </div>
    );
}

export default NewMembersCard;
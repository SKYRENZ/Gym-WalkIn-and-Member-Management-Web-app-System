import React from 'react';

function IncomeSummaryStats({ 
    totalWalkInIncome, 
    totalMemberIncome, 
    totalIncome, 
    period, 
    selectedDate 
}) {
    // Helper function to format date
    const formatDate = (date) => {
        if (!date) return '';
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Helper function to get period label
    const getPeriodLabel = () => {
        if (period === 'daily') {
            return selectedDate 
                ? `Income for ${formatDate(selectedDate)}` 
                : 'Daily Income';
        }
        return 'Monthly Income';
    };

    return (
        <>
            <div className="stat-box">
                <h3>Walk-In Income</h3>
                <p>₱{totalWalkInIncome.toLocaleString()}</p>
            </div>
            <div className="stat-box">
                <h3>Member Income</h3>
                <p>₱{totalMemberIncome.toLocaleString()}</p>
            </div>
            <div className="stat-box total">
                <h3>{getPeriodLabel()}</h3>
                <p>₱{totalIncome.toLocaleString()}</p>
            </div>
        </>
    );
}

export default IncomeSummaryStats;
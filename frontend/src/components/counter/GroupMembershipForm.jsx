// GroupMembershipForm.jsx
import React from 'react';

const GroupMembershipForm = ({ details, onChange }) => {
    return (
        <div className="input-container">
            <div className="input-wrapper">
                <label className="input-label">Group Name*</label>
                <input 
                    type="text" 
                    className="input-field" 
                    value={details.groupName} 
                    onChange={(e) => onChange('groupName', e.target.value)} 
                />
            </div>
            <div className="input-wrapper">
                <label className="input-label">Number of Members*</label>
                <input 
                    type="number" 
                    className="input-field" 
                    value={details.numberOfMembers} 
                    onChange={(e) => onChange('numberOfMembers', e.target.value)} 
                />
            </div>
        </div>
    );
};

export default GroupMembershipForm;
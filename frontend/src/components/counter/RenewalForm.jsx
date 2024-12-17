// RenewalForm.jsx
import React from 'react';

const RenewalForm = ({ details, onChange }) => {
    return (
        <div className="input-container">
            <div className="input-wrapper">
                <label className="input-label">Name*</label>
                <input 
                    type="text" 
                    className="input-field" 
                    value={details.name} 
                    onChange={(e) => onChange('name', e.target.value)} 
                />
            </div>
            <div className="input-wrapper">
                <label className="input-label">Membership ID*</label>
                <input 
                    type="text" 
                    className="input-field" 
                    value={details.membershipId} 
                    onChange={(e) => onChange('membershipId', e.target.value)} 
                />
            </div>
        </div>
    );
};

export default RenewalForm;
// src/components/renewal/RenewalForm.jsx
import React, { useState } from 'react';
import { validateRenewalDetails } from '../../utils/renewalLogic';

const RenewalForm = ({ onNext, onDataUpdate }) => {
    const [name, setName] = useState('');
    const [membershipId, setMembershipId] = useState('');
    const [error, setError] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const validationResult = validateRenewalDetails(
            { name, membershipId }, 
            1  // Step 1 validation
        );

        if (validationResult.valid) {
            // Clear any previous errors
            setError(null);
            
            // Update parent component with form data
            onDataUpdate({ name, membershipId });
            
            // Move to next step
            onNext();
        } else {
            // Set error message
            setError(validationResult.message);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="renewal-form">
            <div className="form-group">
                <label>Name</label>
                <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter customer name"
                    required
                />
            </div>

            <div className="form-group">
                <label>Membership ID</label>
                <input 
                    type="text" 
                    value={membershipId}
                    onChange={(e) => setMembershipId(e.target.value)}
                    placeholder="Enter membership ID"
                    required
                />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="next-button">
                Next
            </button>
        </form>
    );
};

export default RenewalForm;
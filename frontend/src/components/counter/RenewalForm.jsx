import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { validateRenewalDetails } from '../../utils/renewalLogic';
import { PRICES } from '../../config';

const RenewalForm = ({ onChange }) => {
    const [step, setStep] = useState(1);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch members when component mounts
    useEffect(() => {
        fetchActiveMembers();
    }, []);

    // Fetch members when component mounts or when needed
    const fetchActiveMembers = async () => {
        try {
            setLoading(true);
            setError(null);

            // Use the correct API endpoint for active members
            const response = await axios.get('http://localhost:3000/active-members', {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('Full API Response:', response);
            console.log('Response Data:', response.data);

            // Ensure we get an array of members
            const memberData = Array.isArray(response.data) 
                ? response.data 
                : (response.data.members || []);

            console.log('Processed Member Data:', memberData);

            if (memberData.length === 0) {
                setError('No active members found');
            }

            setMembers(memberData);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch active members:', error);
            
            // Log more detailed error information
            if (error.response) {
                console.error('Error Response Data:', error.response.data);
                console.error('Error Response Status:', error.response.status);
                setError(`Failed to fetch members: ${error.response.data.message || 'Server error'}`);
            } else if (error.request) {
                console.error('No response received:', error.request);
                setError('No response from server. Please check your network connection.');
            } else {
                console.error('Error setting up request:', error.message);
                setError(`Error: ${error.message}`);
            }

            setMembers([]);
            setLoading(false);
        }
    };

    // Handle member selection
    const handleMemberSelect = (memberId) => {
        const selectedMember = members.find(m => m.membershipId === memberId);
        if (selectedMember) {
            // Use the onChange prop to update parent component's state
            onChange('membershipId', selectedMember.membershipId);
            onChange('name', selectedMember.name);
            onChange('email', selectedMember.email);
            onChange('phoneNumber', selectedMember.phoneNumber);
        }
    };

    // Optional: Handle input changes if needed
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        onChange(name, value);
    };

    // Render method
    const renderStep = () => {
        return (
            <div className="member-selection-step">
                <h2>Select Member for Renewal</h2>
                {loading ? (
                    <p>Loading members...</p>
                ) : error ? (
                    <div>
                        <p>{error}</p>
                        <button onClick={fetchActiveMembers}>
                            Retry Fetching Members
                        </button>
                    </div>
                ) : (
                    <div>
                        {members.length === 0 ? (
                            <div>
                                <p>No active members found</p>
                                <button onClick={fetchActiveMembers}>
                                    Refresh Members List
                                </button>
                            </div>
                        ) : (
                            <select 
                                onChange={(e) => handleMemberSelect(parseInt(e.target.value))}
                                value=""
                            >
                                <option value="">Select a member</option>
                                {members.map(member => (
                                    <option 
                                        key={member.membershipId || Math.random()} 
                                        value={member.membershipId}
                                    >
                                        {member.name} - {member.email || 'No email'}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="renewal-transaction-container">
            {renderStep()}
        </div>
    );
};

RenewalForm.propTypes = {
    onChange: PropTypes.func.isRequired
};

export default RenewalForm;
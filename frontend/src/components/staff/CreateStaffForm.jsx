import React, { useState } from 'react';

const CreateStaffForm = () => {
    const [name, setName] = useState('');
    const [role, setRole] = useState('');
    const [password, setPassword] = useState('');
    const [contactInfo, setContactInfo] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const staff = { name, role, password, contactInfo };

        try {
            const response = await fetch('http://localhost:5173/api/staff', {  // Ensure this URL is correct
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(staff),
            });

            if (response.ok) {
                alert('Staff account created successfully!');
                setName('');
                setRole('');
                setPassword('');
                setContactInfo('');
            } else {
                const errorData = await response.json();
                alert(`Failed to create staff account: ${errorData.details}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while creating the staff account.');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Name:</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
                <label>Role:</label>
                <input type="text" value={role} onChange={(e) => setRole(e.target.value)} required />
            </div>
            <div>
                <label>Password:</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div>
                <label>Contact Info:</label>
                <input type="text" value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} />
            </div>
            <button type="submit">Create Staff Account</button>
        </form>
    );
};

export default CreateStaffForm;
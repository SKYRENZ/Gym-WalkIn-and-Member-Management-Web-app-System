// src/utils/renewalLogic.js

export const validateRenewalDetails = (details, step) => {
    switch(step) {
        case 1: // Customer Details
            if (!details.name) {
                return { 
                    valid: false, 
                    message: 'Name is required.' 
                };
            }
            if (!details.membershipId) {
                return { 
                    valid: false, 
                    message: 'Membership ID is required.' 
                };
            }
            return { valid: true };

        case 2: // Payment Method
            if (!details.paymentMethod) {
                return {
                    valid: false,
                    message: 'Payment Method is required.'
                };
            }

            // Validate reference number for digital payment methods
            if ((details.paymentMethod === 'Gcash' || details.paymentMethod === 'Paymaya') && !details.referenceNumber) {
                return {
                    valid: false,
                    message: `Reference Number is required for ${details.paymentMethod}`
                };
            }

            // Validate cash received amount
            if (details.paymentMethod === 'Cash' && (!details.receivedAmount || parseFloat(details.receivedAmount) <= 0)) {
                return {
                    valid: false,
                    message: 'Please enter a valid amount received'
                };
            }

            return { valid: true };

        default:
            return { valid: true };
    }
};

export const submitRenewalTransaction = async (details) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/renewMembership`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: details.name,
                membershipId: details.membershipId,
                paymentMethod: details.paymentMethod,
                referenceNumber: details.referenceNumber || null,
                receivedAmount: details.receivedAmount || null,
                // Add any additional fields you might need
                additionalDetails: {
                    date: new Date().toISOString(),
                    source: 'Frontend Membership Renewal'
                }
            }),
        });

        const responseData = await response.json();
        
        if (!response.ok) {
            console.error('Server Error Response:', responseData);
            throw new Error(responseData.error || 'Transaction submission failed');
        }

        // Log the details for debugging or audit purposes
        console.log('Membership Renewal Transaction Details:', {
            name: details.name,
            membershipId: details.membershipId,
            paymentMethod: details.paymentMethod
        });

        return { 
            success: true, 
            data: responseData 
        };
    } catch (error) {
        console.error('Full Membership Renewal Transaction Error:', {
            message: error.message,
            details: {
                name: details.name,
                membershipId: details.membershipId
            }
        });

        return { 
            success: false, 
            error: error.message 
        };
    }
};
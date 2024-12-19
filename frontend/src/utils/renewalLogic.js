export const validateRenewalDetails = (details, step) => {
    switch(step) {
        case 1: // Member Selection
            if (!details.membershipId) {
                return { 
                    valid: false, 
                    message: 'Please select a member for renewal' 
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
            return { valid: true };

        case 3: // Payment Details
            // Validate reference number for digital payment methods
            if ((details.paymentMethod === 'Gcash' || details.paymentMethod === 'Paymaya') 
                && !details.referenceNumber) {
                return {
                    valid: false,
                    message: `Reference Number is required for ${details.paymentMethod}`
                };
            }

            // Validate cash received amount
            if (details.paymentMethod === 'Cash' && 
                (!details.receivedAmount || parseFloat(details.receivedAmount) < 700)) {
                return {
                    valid: false,
                    message: 'Please enter a valid amount (minimum ₱700)'
                };
            }

            return { valid: true };

        default:
            return { valid: true };
    }
};

export const submitRenewalTransaction = async (details) => {
    try {
        console.log('Submitting Renewal Transaction with Details:', {
            membershipId: details.membershipId,
            name: details.name,
            paymentMethod: details.paymentMethod,
            referenceNumber: details.referenceNumber || null,
            receivedAmount: details.receivedAmount || null
        });

        const response = await fetch(`${import.meta.env.VITE_API_URL}/renewMembership`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                membershipId: details.membershipId,
                name: details.name,
                phone: details.phoneNumber,
                email: details.email,
                paymentMethod: details.paymentMethod,
                referenceNumber: details.referenceNumber || null,
                receivedAmount: details.receivedAmount || null,
                additionalDetails: {
                    date: new Date().toISOString(),
                    source: 'Frontend Membership Renewal'
                }
            }),
        });

        // Log the full response for debugging
        console.log('Full API Response:', {
            status: response.status,
            statusText: response.statusText
        });

        // Check if the response is ok
        if (!response.ok) {
            // Try to parse error message
            const errorData = await response.json().catch(() => ({}));
            console.error('Server Error Response:', errorData);
            
            throw new Error(
                errorData.error || 
                `HTTP error! status: ${response.status}`
            );
        }

        const result = await response.json();
        
        // Log successful transaction
        console.log('Renewal Transaction Successful:', result);

        return { 
            success: true, 
            data: result 
        };
    } catch (error) {
        // More comprehensive error logging
        console.error('Full Membership Renewal Transaction Error:', {
            message: error.message,
            details: {
                name: details.name,
                membershipId: details.membershipId,
                paymentMethod: details.paymentMethod
            }
        });

        return { 
            success: false, 
            error: error.message 
        };
    }
};
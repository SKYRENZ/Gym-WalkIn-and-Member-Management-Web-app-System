export const PAYMENT_METHODS = [
    'Cash',
    'Gcash',
    'Paymaya'
];

export const validateWalkInDetails = (details, step) => {
    switch(step) {
        case 1: // Customer Details
            if (!details.name) {
                return { 
                    valid: false, 
                    message: 'Name is required.' 
                };
            }
            if (!details.phoneNumber) {
                return { 
                    valid: false, 
                    message: 'Phone Number is required.' 
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

export const submitWalkInTransaction = async (details) => {
    try {
        const response = await fetch('http://localhost:3000/addWalkInTransaction', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: details.name,
                phone: details.phoneNumber,
                email: details.email,
                paymentMethod: details.paymentMethod,
                referenceNumber: details.referenceNumber || null,
                receivedAmount: details.receivedAmount || null
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Transaction submission failed');
        }

        const result = await response.json();
        return { 
            success: true, 
            data: result 
        };
    } catch (error) {
        console.error('Walk-in Transaction Error:', error);
        return { 
            success: false, 
            error: error.message 
        };
    }
};
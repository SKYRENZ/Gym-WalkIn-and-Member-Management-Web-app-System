const express = require('express');
const pool = require('./db'); // Import your database connection

const app = express();
const PORT = 3000; // You can choose any available port

// Middleware to parse JSON requests
app.use(express.json());

// Endpoint to add a customer, membership, and payment
app.post('/addWalkInTransaction', async (req, res) => {
    const { name, phone, paymentMethod, referenceNumber } = req.body;

    // Validate input
    if (!name || !paymentMethod) {
        return res.status(400).json({ error: 'Name and payment method are required' });
    }

    // Check if payment method requires a reference number
    if ((paymentMethod === 'Gcash' || paymentMethod === 'Paymaya') && !referenceNumber) {
        return res.status(400).json({ error: 'Reference number is required for Gcash and Paymaya' });
    }

    const customerQuery = `
        INSERT INTO Customer (name, contact_info, membership_type, payment_information)
        VALUES ($1, $2, 'Walk In', $3) RETURNING customer_id;
    `;

    const paymentQuery = `
        INSERT INTO Payment (amount, method, status, payment_date, customer_id, gcash_refNum, maya_refNum)
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING payment_id;
    `;

    try {
        const client = await pool.connect();

        // Start a transaction
        await client.query('BEGIN');

        // Insert customer
        const customerResult = await client.query(customerQuery, [name, phone, null]);
        const customerId = customerResult.rows[0].customer_id;

        // Fixed amount for walk-in transactions
        const amount = 60.00; // Amount for walk-in
        const paymentDate = new Date(); // Use current date for payment date
        const paymentStatus = 'Completed'; // Example status

        // Determine reference number based on payment method
        let gcashRefNum = null;
        let mayaRefNum = null;

        if (paymentMethod === 'Gcash') {
            gcashRefNum = referenceNumber; // Assign reference number to Gcash
        } else if (paymentMethod === 'Paymaya') {
            mayaRefNum = referenceNumber; // Assign reference number to Paymaya
        }

        // Log the reference numbers for debugging
        console.log('Gcash Reference Number:', gcashRefNum);
        console.log('Paymaya Reference Number:', mayaRefNum);

        // Log the payment details before inserting
        console.log('Inserting Payment with details:', {
            amount,
            paymentMethod,
            paymentStatus,
            paymentDate,
            customerId,
            gcashRefNum,
            mayaRefNum
        });

        // Insert payment
        const paymentResult = await client.query(paymentQuery, [amount, paymentMethod, paymentStatus, paymentDate, customerId, gcashRefNum, mayaRefNum]);

        // Commit the transaction
        await client.query('COMMIT');

        // Release the client
        client.release();

        res.status(201).json({
            customerId: customerId,
            paymentId: paymentResult.rows[0].payment_id
        });
    } catch (err) {
        console.error('Error adding walk-in transaction:', err);
        await client.query('ROLLBACK'); // Rollback the transaction in case of error
        res.status(500).json({ error: 'Error adding walk-in transaction' });
    }
});

app.post('/addMembershipTransaction', async (req, res) => {
    const { name, email, phone, paymentMethod, referenceNumber } = req.body; // Removed startDate and endDate from destructuring

    // Validate input
    if (!name || !email || !phone || !paymentMethod) {
        return res.status(400).json({ error: 'Name, email, phone, and payment method are required' });
    }

    // Check if payment method requires a reference number
    if ((paymentMethod === 'Gcash' || paymentMethod === 'Paymaya') && !referenceNumber) {
        return res.status(400).json({ error: 'Reference number is required for Gcash and Paymaya' });
    }

    const customerQuery = `
        INSERT INTO Customer (name, contact_info, membership_type, payment_information)
        VALUES ($1, $2, 'Membership', $3) RETURNING customer_id;
    `;

    const membershipQuery = `
        INSERT INTO Membership (customer_id, start_date, end_date, status)
        VALUES ($1, $2, $3, $4) RETURNING membership_id;
    `;

    const paymentQuery = `
        INSERT INTO Payment (amount, method, status, payment_date, customer_id, membership_id, gcash_refNum, maya_refNum)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING payment_id;
    `;

    try {
        const client = await pool.connect();

        // Start a transaction
        await client.query('BEGIN');

        // Insert customer
        const customerResult = await client.query(customerQuery, [name, email, phone]);
        const customerId = customerResult.rows[0].customer_id;

        // Set start date to current date
        const startDate = new Date(); // Current date

        // Set end date to one month from the start date
        const endDate = new Date(startDate);
        endDate.setMonth(startDate.getMonth() + 1); // One month later

        // Insert membership
        const membershipStatus = 'Active'; // Example status
        const membershipResult = await client.query(membershipQuery, [customerId, startDate, endDate, membershipStatus]);
        const membershipId = membershipResult.rows[0].membership_id;

        // Fixed amount for membership transactions
        const amount = 700.00; // Updated amount for membership
        const paymentDate = new Date(); // Use current date for payment date
        const paymentStatus = 'Completed'; // Example status

        // Determine reference number based on payment method
        let gcashRefNum = null;
        let mayaRefNum = null;

        if (paymentMethod === 'Gcash') {
            gcashRefNum = referenceNumber; // Assign reference number to Gcash
        } else if (paymentMethod === 'Paymaya') {
            mayaRefNum = referenceNumber; // Assign reference number to Paymaya
        }

        // Insert payment with membership_id
        const paymentResult = await client.query(paymentQuery, [amount, paymentMethod, paymentStatus, paymentDate, customerId, membershipId, gcashRefNum, mayaRefNum]);

        // Commit the transaction
        await client.query('COMMIT');

        // Release the client
        client.release();

        res.status(201).json({
            customerId: customerId,
            membershipId: membershipId,
            paymentId: paymentResult.rows[0].payment_id
        });
    } catch (err) {
        console.error('Error adding membership transaction:', err);
        await client.query('ROLLBACK'); // Rollback the transaction in case of error
        res.status(500).json({ error: 'Error adding membership transaction' });
    }
});

app.post('/renewMembership', async (req, res) => {
    const { name, paymentMethod, referenceNumber } = req.body;

    // Validate input
    if (!name || !paymentMethod) {
        return res.status(400).json({ error: 'Name and payment method are required' });
    }

    // Check if payment method requires a reference number
    if ((paymentMethod === 'Gcash' || paymentMethod === 'Paymaya') && !referenceNumber) {
        return res.status(400).json({ error: 'Reference number is required for Gcash and Paymaya' });
    }

    const customerQuery = `
        SELECT customer_id FROM Customer WHERE name = $1;
    `;

    const membershipQuery = `
        SELECT membership_id, end_date FROM Membership WHERE customer_id = $1;
    `;

    try {
        const client = await pool.connect();

        // Start a transaction
        await client.query('BEGIN');

        // Check if customer exists
        const customerResult = await client.query(customerQuery, [name]);
        if (customerResult.rows.length === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        const customerId = customerResult.rows[0].customer_id;

        // Get membership details
        const membershipResult = await client.query(membershipQuery, [customerId]);
        if (membershipResult.rows.length === 0) {
            return res.status(404).json({ error: 'Membership not found' });
        }

        const membershipId = membershipResult.rows[0].membership_id;
        const currentEndDate = new Date(membershipResult.rows[0].end_date);
        
        // Extend the membership by one month
        currentEndDate.setMonth(currentEndDate.getMonth() + 1);

        const updateMembershipQuery = `
            UPDATE Membership SET end_date = $1 WHERE membership_id = $2;
        `;

        // Update the membership end date
        await client.query(updateMembershipQuery, [currentEndDate, membershipId]);

        // Fixed amount for renewal
        const amount = 700.00; // Set the fixed renewal amount
        const paymentDate = new Date(); // Use current date for payment date
        const paymentStatus = 'Completed'; // Example status

        // Determine reference number based on payment method
        let gcashRefNum = null;
        let mayaRefNum = null;

        if (paymentMethod === 'Gcash') {
            gcashRefNum = referenceNumber; // Assign reference number to Gcash
        } else if (paymentMethod === 'Paymaya') {
            mayaRefNum = referenceNumber; // Assign reference number to Paymaya
        }

        const paymentQuery = `
            INSERT INTO Payment (amount, method, status, payment_date, customer_id, membership_id, gcash_refNum, maya_refNum)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING payment_id;
        `;

        // Insert payment record
        const paymentResult = await client.query(paymentQuery, [amount, paymentMethod, paymentStatus, paymentDate, customerId, membershipId, gcashRefNum, mayaRefNum]);

        // Commit the transaction
        await client.query('COMMIT');

        // Release the client
        client.release();

        res.status(200).json({
            message: 'Membership renewed successfully',
            membershipId: membershipId,
            newEndDate: currentEndDate,
            paymentId: paymentResult.rows[0].payment_id
        });
    } catch (err) {
        console.error('Error renewing membership:', err);
        await client.query('ROLLBACK'); // Rollback the transaction in case of error
        res.status(500).json({ error: 'Error renewing membership' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
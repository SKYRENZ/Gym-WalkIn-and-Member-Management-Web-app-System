const express = require('express');
const pool = require('./db'); // Import your database connection

const app = express();
const PORT = 3000; // You can choose any available port

// Middleware to parse JSON requests
app.use(express.json());

// Endpoint to add a walkin, membership, renewals and payment
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
        INSERT INTO Customer (name, email, membership_type, contact_info)
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
    const { name, email, phone, paymentMethod, referenceNumber } = req.body;

    // Validate input
    if (!name || !email || !phone || !paymentMethod) {
        return res.status(400).json({ error: 'Name, email, phone, and payment method are required' });
    }

    // Check if payment method requires a reference number
    if ((paymentMethod === 'Gcash' || paymentMethod === 'Paymaya') && !referenceNumber) {
        return res.status(400).json({ error: 'Reference number is required for Gcash and Paymaya' });
    }

    const customerQuery = `
        INSERT INTO Customer (name, email, membership_type, contact_info)
        VALUES ($1, $2, 'Membership', $3) RETURNING customer_id;
    `;

    const membershipQuery = `
        INSERT INTO Membership (customer_id, start_date, end_date, membership_type)
        VALUES ($1, $2, $3, $4) RETURNING membership_id;
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
        const customerResult = await client.query(customerQuery, [name, email, phone]);
        const customerId = customerResult.rows[0].customer_id;

        // Define membership details
        const startDate = new Date();
        const endDate = new Date();
        endDate.setFullYear(startDate.getFullYear() + 1); // Set end date to one year from now
        const membershipType = 'Standard'; // Example membership type

        // Insert membership
        const membershipResult = await client.query(membershipQuery, [customerId, startDate, endDate, membershipType]);
        const membershipId = membershipResult.rows[0].membership_id;

        // Fixed amount for membership transactions
        const amount = 120.00; // Amount for membership
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

        // Insert payment
        const paymentResult = await client.query(paymentQuery, [amount, paymentMethod, paymentStatus, paymentDate, customerId, gcashRefNum, mayaRefNum]);

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

// Endpoint to fetch customer membership information
app.get('/getCustomerTotalRecords/:name', async (req, res) => {
    const { name } = req.params;

    const totalRecordsQuery = `
        SELECT 
            c.name, 
            COALESCE(SUM(p.amount), 0) AS total_payment,
            COUNT(DISTINCT p.payment_id) AS total_payments,
            0 AS total_entries,  -- Set total_entries to 0 for now
            ARRAY_AGG(ROW(p.amount, p.method, p.payment_date)) AS payment_records
        FROM 
            Customer c
        LEFT JOIN 
            Payment p ON p.customer_id = c.customer_id
        WHERE 
            c.name = $1
        GROUP BY 
            c.name;
    `;

    let client; // Declare client variable here

    try {
        client = await pool.connect(); // Get a client from the pool
        const result = await client.query(totalRecordsQuery, [name]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching customer total records:', err.message); // Log the error message
        res.status(500).json({ error: 'Error fetching customer total records' });
    } finally {
        // Ensure the client is released back to the pool
        if (client) {
            client.release();
        }
    }
});

app.get('/getCustomerTotalRecords/:name', async (req, res) => {
    const { name } = req.params;

    const totalRecordsQuery = `
        SELECT 
            c.name, 
            c.email, 
            c.contact_info AS phone, 
            COALESCE(SUM(p.amount), 0) AS total_payment,
            COUNT(DISTINCT p.payment_id) AS total_payments,
            0 AS total_entries,  -- Set total_entries to 0 for now
            ARRAY_AGG(ROW(p.amount, p.method, p.payment_date)) AS payment_records
        FROM 
            Customer c
        LEFT JOIN 
            Payment p ON p.customer_id = c.customer_id
        WHERE 
            c.name = $1
        GROUP BY 
            c.name, c.email, c.contact_info;
    `;

    let client; // Declare client variable here

    try {
        client = await pool.connect(); // Get a client from the pool
        const result = await client.query(totalRecordsQuery, [name]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching customer total records:', err.message); // Log the error message
        res.status(500).json({ error: 'Error fetching customer total records' });
    } finally {
        // Ensure the client is released back to the pool
        if (client) {
            client.release();
        }
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
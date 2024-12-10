const express = require('express');
const { updateMembershipStatus } = require('./membershipService'); // Import the function
const pool = require('./db'); // Import your database connection
const cron = require('node-cron');
const app = express();
const PORT = 3000; // You can choose any available port

// Middleware to parse JSON requests
app.use(express.json());

// Schedule the updateMembershipStatus function to run daily at midnight
cron.schedule('0 0 * * *', async () => {
    await updateMembershipStatus();
    console.log('Membership statuses updated.');
});

// Example route to fetch memberships
app.get('/memberships', async (req, res) => {
    try {
        await updateMembershipStatus(); // Update statuses before fetching

        const membershipsQuery = `
            SELECT * FROM Membership;
        `;
        const result = await pool.query(membershipsQuery);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching memberships:', error);
        res.status(500).json({ error: 'An error occurred while fetching memberships' });
    }
});

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
        const paymentDate = new Date().toISOString().split('T')[0]; // Use current date for payment date without time
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
        VALUES ($1, $2, 'Membership', $3) RETURNING customer_id, membership_type;
    `;

    const membershipQuery = `
        INSERT INTO Membership (customer_id, start_date, end_date, status)
        VALUES ($1, $2, $3, $4) RETURNING membership_id;
    `;

    const paymentQuery = `
        INSERT INTO Payment (amount, method, status, payment_date, customer_id, gcash_refNum, maya_refNum)
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING payment_id;
    `;

    let client; // Declare client variable here

    try {
        client = await pool.connect();

        // Start a transaction
        await client.query('BEGIN');

        // Insert customer
        const customerResult = await client.query(customerQuery, [name, email, phone]);
        const customerId = customerResult.rows[0].customer_id;
        const membershipType = customerResult.rows[0].membership_type;

        // Check if the membership type is valid for membership
        if (membershipType !== 'Membership') {
            return res.status(400).json({ error: 'Customer is not eligible for membership' });
        }

        // Define membership details
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(startDate.getMonth() + 1); // Set end date to one month from now

        // Set the status for the membership to "Active"
        const membershipStatus = 'Active';

        // Insert membership
        const membershipResult = await client.query(membershipQuery, [customerId, startDate, endDate, membershipStatus]);
        const membershipId = membershipResult.rows[0].membership_id;

        // Fixed amount for membership transactions
        const amount = 120.00; // Amount for membership
        const paymentDate = new Date().toISOString().split('T')[0]; // Use current date for payment date without time
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
        await client.query(paymentQuery, [amount, paymentMethod, paymentStatus, paymentDate, customerId, gcashRefNum, mayaRefNum]);

        // Commit the transaction
        await client.query('COMMIT');

        // Send success response
        res.status(201).json({ message: 'Membership transaction added successfully' });

    } catch (error) {
        // Rollback the transaction in case of error
        if (client) {
            await client.query('ROLLBACK');
        }
        console.error('Error adding membership transaction:', error);
        res.status(500).json({ error: 'An error occurred while adding the membership transaction' });
    } finally {
        // Release the client back to the pool
        if (client) {
            client.release();
        }
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
        // Fixed amount for renewal
        const amount = 700.00; // Set the fixed renewal amount
        const paymentDate = new Date().toISOString().split('T')[0]; // Use current date for payment date without time
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

//walk in customer records
app.get('/getWalkInCustomerRecords', async (req, res) => {
    const walkInRecordsQuery = `
        SELECT 
            c.name, 
            COUNT(p.payment_id) AS total_entries,
            MAX(p.payment_date) AS recent_payment_date
        FROM 
            Customer c
        LEFT JOIN 
            Payment p ON p.customer_id = c.customer_id
        WHERE 
            c.membership_type = 'Walk In'
        GROUP BY 
            c.name
        ORDER BY 
            c.name;  -- Optional: Order by name
    `;

    let client; // Declare client variable here

    try {
        client = await pool.connect(); // Get a client from the pool
        const result = await client.query(walkInRecordsQuery);

        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error fetching walk-in customer records:', err.message); // Log the error message
        res.status(500).json({ error: 'Error fetching walk-in customer records' });
    } finally {
        // Ensure the client is released back to the pool
        if (client) {
            client.release();
        }
    }
});
//membership customer records

app.get('/getMemberCustomerRecords', async (req, res) => {
    const memberRecordsQuery = `
        SELECT 
            c.name, 
            COUNT(p.payment_id) AS total_entries,
            MAX(DATE(p.payment_date)) AS recent_payment_date  -- Use DATE to get only the date part
        FROM 
            Customer c
        LEFT JOIN 
            Payment p ON p.customer_id = c.customer_id
        WHERE 
            c.membership_type != 'Walk In'  -- Filter for members only
        GROUP BY 
            c.name
        ORDER BY 
            c.name;  -- Optional: Order by name
    `;

    let client; // Declare client variable here

    try {
        client = await pool.connect(); // Get a client from the pool
        const result = await client.query(memberRecordsQuery);

        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error fetching member customer records:', err.message); // Log the error message
        res.status(500).json({ error: 'Error fetching member customer records' });
    } finally {
        // Ensure the client is released back to the pool
        if (client) {
            client.release();
        }
    }
});

// Endpoint to fetch customer membership information
app.get('/getCustomerMember_TotalRecords/:name', async (req, res) => {
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

app.get('/getCustomerMember_info/:name', async (req, res) => {
    const { name } = req.params;

    const customerQuery = `
        SELECT c.name, c.email, c.contact_info AS phone, m.end_date
        FROM Customer c
        JOIN Membership m ON c.customer_id = m.customer_id
        WHERE c.name = $1
        GROUP BY c.name, c.email, c.contact_info, m.end_date;
    `;

    let client; // Declare client variable here

    try {
        client = await pool.connect(); // Get a client from the pool
        const result = await client.query(customerQuery, [name]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching customer membership:', err.message); // Log the error message
        res.status(500).json({ error: 'Error fetching customer membership' });
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
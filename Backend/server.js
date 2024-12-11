const express = require('express');
const membershipService = require('./membershipService');
const pool = require('./db'); // Import your database connection
const cron = require('node-cron');
const corsMiddleware = require('./Middleware/corsMiddleware'); // Correct path
const app = express();
const PORT = 3000; // You can choose any available port
const routes = require('./controllers/routes'); // Adjust the path if necessary
// Middleware to parse JSON requests
app.use(express.json());

// Use the CORS middleware
app.use(corsMiddleware);
app.use('/api', routes);
// Schedule the updateMembershipStatus function to run daily at midnight
cron.schedule('0 0 * * *', async () => {
    try {
        await membershipService.updateMembershipStatus();
        console.log('Membership statuses updated.');
    } catch (error) {
        console.error('Error during scheduled membership status update:', error.message);
    }
});

//customer records
app.get('/customerTracking', async (req, res) => {
    // Get the date from the query parameter, default to the current date if not provided
    const dateParam = req.query.date || new Date().toISOString().split('T')[0]; // Default to today's date
    const testDate = new Date(dateParam);
    
    // Check if the date is valid
    if (isNaN(testDate.getTime())) {
        return res.status(400).json({ error: 'Invalid date format. Please use YYYY-MM-DD.' });
    }

    const startOfDay = new Date(testDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(testDate.setHours(23, 59, 59, 999));

    const trackingQuery = `
        SELECT 
            c.name, 
            ci.check_in_time AS timestamp, 
            'Member' AS role,
            NULL AS payment
        FROM 
            Customer c
        JOIN 
            Membership m ON c.customer_id = m.customer_id
        JOIN 
            CheckIn ci ON m.membership_id = ci.membership_id
        WHERE 
            ci.check_in_time >= $1 AND ci.check_in_time <= $2

        UNION ALL

        SELECT 
            c.name, 
            p.payment_date AS timestamp, 
            'Walk In' AS role,
            p.amount AS payment
        FROM 
            Customer c
        LEFT JOIN 
            Payment p ON c.customer_id = p.customer_id
        WHERE 
            c.membership_type = 'Walk In' 
            AND p.payment_date >= $1 AND p.payment_date <= $2
        ORDER BY 
            timestamp;
    `;

    let client; // Declare client variable here

    try {
        client = await pool.connect(); // Get a client from the pool
        const result = await client.query(trackingQuery, [startOfDay, endOfDay]);

        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error fetching customer tracking records:', err.message); // Log the error message
        res.status(500).json({ error: 'Error fetching customer tracking records' });
    } finally {
        // Ensure the client is released back to the pool
        if (client) {
            client.release();
        }
    }
});
// customer records
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
            COALESCE(SUM(p.amount), 0) AS total_payment,  -- Total payment amount
            COUNT(DISTINCT p.payment_id) AS total_payments,  -- Count of distinct payments
            COUNT(ci.check_in_time) AS total_checkins  -- Count of check-ins
        FROM 
            Customer c
        LEFT JOIN 
            Payment p ON c.customer_id = p.customer_id
        LEFT JOIN 
            Membership m ON c.customer_id = m.customer_id
        LEFT JOIN 
            CheckIn ci ON m.membership_id = ci.membership_id  -- Join with CheckIn table
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
        console.error('Error fetching total records:', err.message); // Log the error message
        res.status(500).json({ error: 'Error fetching total records' });
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

app.get('/qrcodes/:membershipId', (req, res) => {
    const { membershipId } = req.params;
    const qrCodePath = path.join(__dirname, 'qrcodes', `${membershipId}.png`);

    res.sendFile(qrCodePath, (err) => {
        if (err) {
            res.status(404).send('QR code not found');
        }
    });
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
    const { name, email, phone, paymentMethod } = req.body;

    // Validate input
    if (!name || !email || !paymentMethod) {
        return res.status(400).json({ error: 'Name, email, and payment method are required' });
    }

    const membershipType = 'Member'; // Set this to the appropriate membership type for members

    // Define the customerQuery
    const customerQuery = `
        INSERT INTO Customer (name, email, membership_type, contact_info)
        VALUES ($1, $2, $3, $4) RETURNING customer_id;
    `;

    // Define the membershipQuery
    const membershipQuery = `
        INSERT INTO Membership (customer_id, start_date, end_date, status)
        VALUES ($1, $2, $3, $4) RETURNING membership_id;
    `;

    // Define the paymentQuery
    const paymentQuery = `
        INSERT INTO Payment (amount, method, status, payment_date, customer_id)
        VALUES ($1, $2, $3, $4, $5) RETURNING payment_id;
    `;

    let client;

    try {
        client = await pool.connect();
        await client.query('BEGIN');

        // Insert customer
        const customerResult = await client.query(customerQuery, [name, email, membershipType, phone]);
        const customerId = customerResult.rows[0].customer_id;

        // Define membership details
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(startDate.getMonth() + 1); // Set end date to one month from now
        const membershipStatus = 'Active';

        // Insert membership
        const membershipResult = await client.query(membershipQuery, [customerId, startDate, endDate, membershipStatus]);
        const membershipId = membershipResult.rows[0].membership_id;

        // Insert payment
        const amount = 120.00; // Amount for membership
        const paymentDate = new Date().toISOString().split('T')[0]; // Use current date for payment date without time
        const paymentStatus = 'Completed'; // Example status

        await client.query(paymentQuery, [amount, paymentMethod, paymentStatus, paymentDate, customerId]);

        // After generating the QR code
const qrCodePath = await membershipService.generateQRCode(membershipId);
console.log('QR Code generated at:', qrCodePath);

// Update the QR code path in the database
await membershipService.updateQRCodePath(membershipId, qrCodePath);
        await client.query('COMMIT');
        res.status(201).json({ message: 'Membership transaction added successfully', membershipId, qrCodePath });
    } catch (error) {
        if (client) {
            await client.query('ROLLBACK');
        }
        console.error('Error adding membership transaction:', error);
        res.status(500).json({ error: 'An error occurred while adding the membership transaction' });
    } finally {
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

app.post('/generateQRCodesForExistingMembers', async (req, res) => {
    try {
        await generateQRCodesForExistingMembers(); // Call the function to generate QR codes
        res.status(200).json({ message: 'QR codes generated for existing members successfully' });
    } catch (error) {
        console.error('Error in /generateQRCodesForExistingMembers:', error.message); // Log the specific error
        res.status(500).json({ error: 'Error generating QR codes for existing members' });
    }
});

const QRCode = require('qrcode'); // Ensure you have this package installed

app.post('/checkIn', async (req, res) => {
    const { membershipId } = req.body; // Accept membership ID

    // Validate input
    if (!membershipId) {
        return res.status(400).json({ error: 'Membership ID is required' });
    }

    try {
        // Check if membershipId is a valid number
        const membershipIdNum = parseInt(membershipId);
        if (isNaN(membershipIdNum)) {
            return res.status(400).json({ error: 'Invalid Membership ID' });
        }

        await checkInMember(membershipIdNum); // Call the check-in function
        res.status(200).json({ message: `Member with Membership ID ${membershipIdNum} checked in successfully` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//LOGIN UI
// Endpoint to add a staff member
app.post('/addStaff', async (req, res) => {
    const { name, role, password, contact_info } = req.body;

    // Validate input
    if (!name || !role || !password) {
        return res.status(400).json({ error: 'Name, role, and password are required' });
    }

    const staffQuery = `
        INSERT INTO Staff (name, role, password, contact_info)
        VALUES ($1, $2, $3, $4) RETURNING staff_id;
    `;

    try {
        const client = await pool.connect();
        const result = await client.query(staffQuery, [name, role, password, contact_info]);
        res.status(201).json({ message: 'Staff member added successfully', staffId: result.rows[0].staff_id });
    } catch (error) {
        console.error('Error adding staff member:', error);
        res.status(500).json({ error: 'Error adding staff member' });
    } finally {
        if (client) {
            client.release();
        }
    }
});

// Endpoint for staff login
app.post('/staffLogin', async (req, res) => {
    const { password } = req.body;

    // Validate input
    if (!password) {
        return res.status(400).json({ error: 'Password is required' });
    }

    const loginQuery = `
        SELECT * FROM Staff WHERE password = $1;  -- Adjust this query as needed
    `;

    let client; // Declare client variable here

    try {
        client = await pool.connect();
        const result = await client.query(loginQuery, [password]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const staffMember = result.rows[0];

        // Check if the role is staff
        if (staffMember.role === 'staff') {
            res.status(200).json({ message: 'Login successful', staff: staffMember });
        } else {
            res.status(403).json({ error: 'You do not have access to the admin page.' });
        }
    } catch (error) {
        console.error('Error during staff login:', error);
        res.status(500).json({ error: 'Error during staff login' });
    } finally {
        // Ensure the client is released back to the pool
        if (client) {
            client.release();
        }
    }
});
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
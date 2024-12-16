const express = require('express');
const cors = require('cors');
const {
    updateMembershipStatus,
    checkInMember,
    generateQRCode,
    generateQRCodesForExistingMembers
} = require('./membershipService');
const pool = require('./db'); // Import your database connection
const cron = require('node-cron');
const app = express();
const PORT = process.env.PORT || 3000;
const { PRICES } = require('./config');
const corsConfig = require('./Middleware/corsConfig');


// Apply CORS middleware
app.use(cors(corsConfig.corsOptions));

// Other middleware
app.use(express.json());

// Schedule the updateMembershipStatus function to run daily at midnight
cron.schedule('0 0 * * *', async () => {
    await updateMembershipStatus();
    console.log('Membership statuses updated.');
});


// Endpoint to get available years
app.get('/getAvailableYears', async (req, res) => {
    try {
        const yearsQuery = `
        SELECT DISTINCT EXTRACT(YEAR FROM start_date) AS year 
        FROM Membership 
        UNION 
        SELECT DISTINCT EXTRACT(YEAR FROM payment_date) 
        FROM Payment
      `;

        const result = await pool.query(yearsQuery);

        const years = result.rows.map(row => row.year);

        // Ensure current year is included if not already present
        const currentYear = new Date().getFullYear();
        if (!years.includes(currentYear)) {
            years.push(currentYear);
        }

        res.status(200).json({
            "success": true,
            "years": [2023, 2022, 2021]
        });
    } catch (err) {
        console.error('Error fetching available years:', err);
        res.status(500).json({
            success: false,
            error: 'Error fetching available years',
            details: err.message
        });
    }
});
// Example route to fetch memberships

app.get('/memberships', async (req, res) => {
    const { year } = req.query;

    try {
        await updateMembershipStatus(); // Update statuses before fetching

        const membershipsQuery = year
            ? `SELECT * FROM Membership WHERE EXTRACT(YEAR FROM start_date) = $1;`
            : `SELECT * FROM Membership;`;

        const result = year
            ? await pool.query(membershipsQuery, [year])
            : await pool.query(membershipsQuery);

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching memberships:', error);
        res.status(500).json({ error: 'An error occurred while fetching memberships' });
    }
});
//customer records
app.get('/customerTracking', async (req, res) => {
    const dateParam = req.query.date || new Date().toISOString().split('T')[0];
    const testDate = new Date(dateParam);

    // Validate date input
    if (isNaN(testDate.getTime())) {
        return res.status(400).json({
            error: 'Invalid date format. Please use YYYY-MM-DD.',
            success: false
        });
    }

    const startOfDay = new Date(testDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(testDate.setHours(23, 59, 59, 999));

    const trackingQuery = `
        -- Member Check-ins 
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
            DATE(ci.check_in_time AT TIME ZONE 'Asia/Manila') = DATE($1 AT TIME ZONE 'Asia/Manila') 

        UNION ALL 

        -- Walk-in Payments 
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
            AND DATE(p.payment_date AT TIME ZONE 'Asia/Manila') = DATE($1 AT TIME ZONE 'Asia/Manila') 

        UNION ALL 

        -- Member Registrations 
        SELECT 
            c.name, 
            m.start_date AS timestamp, 
            'Member' AS role, 
            NULL AS payment 
        FROM 
            Customer c 
        JOIN 
            Membership m ON c.customer_id = m.customer_id 
        WHERE 
            DATE(m.start_date AT TIME ZONE 'Asia/Manila') = DATE($1 AT TIME ZONE 'Asia/Manila') 

        ORDER BY 
            timestamp;
    `;

    let client;

    try {
        client = await pool.connect();
        const result = await client.query(trackingQuery, [startOfDay]);

        // Ensure data is always an array
        const formattedResult = Array.isArray(result.rows)
            ? result.rows.map(row => {
                const timestamp = row.timestamp ?
                    new Date(row.timestamp).toLocaleTimeString('en-PH', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                        timeZone: 'Asia/Manila'
                    }) :
                    null;

                return {
                    name: row.name,
                    timestamp: timestamp,
                    role: row.role,
                    payment: row.payment ? parseFloat(row.payment).toFixed(2) : null
                };
            })
            : [];

        res.status(200).json({
            success: true,
            data: formattedResult,
            metadata: {
                date: dateParam,
                total_entries: formattedResult.length,
                total_members: formattedResult.filter(entry => entry.role === 'Member').length,
                total_walk_ins: formattedResult.filter(entry => entry.role === 'Walk In').length
            }
        });
    } catch (err) {
        console.error('Error fetching customer tracking records:', err);
        res.status(500).json({
            success: false,
            data: [], // Always return an array
            error: 'Error fetching customer tracking records',
            details: err.message
        });
    } finally {
        if (client) {
            client.release();
        }
    }
});
// In server.js or a separate route file
// Example route modification
app.get('/getDailyCustomerRecords', async (req, res) => {
    const { year, type } = req.query;

    // Validate year
    const currentYear = new Date().getFullYear();
    const parsedYear = parseInt(year, 10);

    if (isNaN(parsedYear) || parsedYear < 2000 || parsedYear > currentYear + 1) {
        return res.status(400).json({
            error: 'Invalid year',
            message: `Please provide a valid year between 2000 and ${currentYear + 1}`
        });
    }

    try {
        const dailyQuery = `
        SELECT 
          DATE(payment_date) AS date, 
          COUNT(payment_id) AS total_entries, 
          SUM(amount) AS total_income 
        FROM 
          Payment p 
        JOIN 
          Customer c ON p.customer_id = c.customer_id 
        WHERE 
          c.membership_type = $1 
          AND EXTRACT(YEAR FROM payment_date) = $2 
        GROUP BY 
          DATE(payment_date) 
        ORDER BY 
          date;
      `;

        const result = await pool.query(dailyQuery, [type, parsedYear]);

        res.status(200).json({
            success: true,
            data: result.rows.map(row => ({
                date: row.date,
                total_entries: parseInt(row.total_entries),
                total_income: parseFloat(row.total_income)
            }))
        });
    } catch (error) {
        console.error('Error fetching daily records:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch daily records',
            message: error.message
        });
    }
});
// customer records
// Similar implementation for walk-in records
app.get('/getWalkInCustomerRecords', async (req, res) => {
    const { year, period = 'monthly' } = req.query;

    // Validate year
    const currentYear = new Date().getFullYear();
    const parsedYear = parseInt(year, 10);

    if (isNaN(parsedYear) || parsedYear < 2000 || parsedYear > currentYear + 1) {
        return res.status(400).json({
            error: 'Invalid year',
            message: `Please provide a valid year between 2000 and ${currentYear + 1}`
        });
    }

    try {
        let query;
        let queryParams;

        switch (period) {
            case 'monthly':
                query = `
            SELECT 
              EXTRACT(MONTH FROM p.payment_date) AS month,
              COUNT(p.payment_id) AS total_entries,
              MAX(p.payment_date) AS recent_payment_date,
              SUM(p.amount) AS total_income
            FROM 
              Payment p
            JOIN 
              Customer c ON p.customer_id = c.customer_id
            WHERE 
              c.membership_type = 'Walk In'
              AND EXTRACT(YEAR FROM p.payment_date) = $1
            GROUP BY 
              EXTRACT(MONTH FROM p.payment_date)
            ORDER BY 
              month;
          `;
                queryParams = [year];
                break;

            case 'quarterly':
                query = `
            SELECT 
              CEIL(EXTRACT(MONTH FROM p.payment_date) / 3.0) AS month,
              COUNT(p.payment_id) AS total_entries,
              MAX(p.payment_date) AS recent_payment_date,
              SUM(p.amount) AS total_income
            FROM 
              Payment p
            JOIN 
              Customer c ON p.customer_id = c.customer_id
            WHERE 
              c.membership_type = 'Walk In'
              AND EXTRACT(YEAR FROM p.payment_date) = $1
            GROUP BY 
              CEIL(EXTRACT(MONTH FROM p.payment_date) / 3.0)
            ORDER BY 
              month;
          `;
                queryParams = [year];
                break;

            // Retain existing functionality for other periods if needed
            default:
                // Fallback to existing implementation or return an error
                return res.status(400).json({
                    success: false,
                    error: 'Invalid period. Use "monthly" or "quarterly".'
                });
        }

        const result = await pool.query(query, queryParams);

        // Preserve existing response structure for compatibility
        res.status(200).json({
            success: true,
            data: result.rows.map(row => ({
                month: row.month,
                total_entries: parseInt(row.total_entries),
                total_income: parseFloat(row.total_income),
                // Preserve any existing fields used in other components
                recent_payment_date: row.recent_payment_date
            })),
            metadata: {
                year: year,
                period: period,
                total_income: result.rows.reduce((sum, row) => sum + parseFloat(row.total_income), 0),
                total_entries: result.rows.reduce((sum, row) => sum + parseInt(row.total_entries), 0)
            }
        });

    } catch (err) {
        console.error('Error fetching walk-in customer records:', err);
        res.status(500).json({
            success: false,
            error: 'Error fetching walk-in customer records',
            details: err.message
        });
    }
});

// Create a similar implementation for getMemberCustomerRecords
app.get('/getMemberCustomerRecords', async (req, res) => {
    const { year, period = 'monthly' } = req.query;

    // Validate year
    const currentYear = new Date().getFullYear();
    const parsedYear = parseInt(year, 10);

    if (isNaN(parsedYear) || parsedYear < 2000 || parsedYear > currentYear + 1) {
        return res.status(400).json({
            error: 'Invalid year',
            message: `Please provide a valid year between 2000 and ${currentYear + 1}`
        });
    }

    try {
        let query;
        let queryParams;

        switch (period) {
            case 'monthly':
                query = `
            SELECT 
              EXTRACT(MONTH FROM p.payment_date) AS month,
              COUNT(p.payment_id) AS total_entries,
              MAX(p.payment_date) AS recent_payment_date,
              SUM(p.amount) AS total_income
            FROM 
              Payment p
            JOIN 
              Customer c ON p.customer_id = c.customer_id
            WHERE 
              c.membership_type = 'Member'
              AND EXTRACT(YEAR FROM p.payment_date) = $1
            GROUP BY 
              EXTRACT(MONTH FROM p.payment_date)
            ORDER BY 
              month;
          `;
                queryParams = [year];
                break;

            case 'quarterly':
                query = `
            SELECT 
              CEIL(EXTRACT(MONTH FROM p.payment_date) / 3.0) AS month,
              COUNT(p.payment_id) AS total_entries,
              MAX(p.payment_date) AS recent_payment_date,
              SUM(p.amount) AS total_income
            FROM 
              Payment p
            JOIN 
              Customer c ON p.customer_id = c.customer_id
            WHERE 
              c.membership_type = 'Member'
              AND EXTRACT(YEAR FROM p.payment_date) = $1
            GROUP BY 
              CEIL(EXTRACT(MONTH FROM p.payment_date) / 3.0)
            ORDER BY 
              month;
          `;
                queryParams = [year];
                break;

            default:
                return res.status(400).json({
                    success: false,
                    error: 'Invalid period. Use "monthly" or "quarterly".'
                });
        }

        const result = await pool.query(query, queryParams);

        // Preserve existing response structure for compatibility
        res.status(200).json({
            success: true,
            data: result.rows.map(row => ({
                month: row.month,
                total_entries: parseInt(row.total_entries),
                total_income: parseFloat(row.total_income),
                recent_payment_date: row.recent_payment_date
            })),
            metadata: {
                year: year,
                period: period,
                total_income: result.rows.reduce((sum, row) => sum + parseFloat(row.total_income), 0),
                total_entries: result.rows.reduce((sum, row) => sum + parseInt(row.total_entries), 0)
            }
        });

    } catch (err) {
        console.error('Error fetching membership customer records:', err);
        res.status(500).json({
            success: false,
            error: 'Error fetching membership customer records',
            details: err.message
        });
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
    const amount = PRICES.WALK_IN; // Use global walk-in price

    // Validate input
    if (!name || !paymentMethod) {
        return res.status(400).json({ error: 'Name and payment method are required' });
    }

    // Check if payment method requires a reference number
    if ((paymentMethod === 'Gcash' || paymentMethod === 'Paymaya') && !referenceNumber) {
        return res.status(400).json({ error: 'Reference number is required for Gcash and Paymaya' });
    }

    // Log the entire request body for debugging
    console.log('Request Body:', req.body);

    const customerQuery = `
        INSERT INTO Customer (name, email, membership_type, contact_info)
        VALUES ($1, $2, 'Walk In', $3) RETURNING customer_id;
    `;

    const paymentQuery = `
        INSERT INTO Payment (amount, method, status, payment_date, customer_id, gcash_refNum, maya_refNum)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4, $5, $6) RETURNING payment_id;
    `;

    let client;

    try {
        // Get a client from the pool
        client = await pool.connect();

        // Start a transaction
        await client.query('BEGIN');

        // Insert customer
        const customerResult = await client.query(customerQuery, [
            name,
            null, // email 
            phone || null // contact_info
        ]);
        const customerId = customerResult.rows[0].customer_id;

        const paymentStatus = 'Completed'; // Example status

        // Determine reference number based on payment method
        let gcashRefNum = null;
        let mayaRefNum = null;

        if (paymentMethod === 'Gcash') {
            gcashRefNum = referenceNumber;
        } else if (paymentMethod === 'Paymaya') {
            mayaRefNum = referenceNumber;
        }

        // Insert payment using CURRENT_TIMESTAMP
        const paymentResult = await client.query(paymentQuery, [
            amount,
            paymentMethod,
            paymentStatus,
            customerId,
            gcashRefNum,
            mayaRefNum
        ]);

        // Commit the transaction
        await client.query('COMMIT');

        // Respond with success
        res.status(201).json({
            customerId: customerId,
            paymentId: paymentResult.rows[0].payment_id
        });

    } catch (err) {
        // Log the full error for debugging
        console.error('Error adding walk-in transaction:', err);
        console.error('Full error details:', JSON.stringify(err, null, 2));

        // Rollback the transaction in case of error
        if (client) {
            try {
                await client.query('ROLLBACK');
            } catch (rollbackErr) {
                console.error('Error during rollback:', rollbackErr);
            }
        }

        // Send error response
        res.status(500).json({
            error: 'Error adding walk-in transaction',
            details: err.message,
            fullError: err
        });

    } finally {
        // Ensure client is released only if it exists
        if (client) {
            try {
                client.release();
            } catch (releaseErr) {
                console.error('Error releasing client:', releaseErr);
            }
        }
    }
});

app.post('/addMembershipTransaction', async (req, res) => {
    const { name, email, phone, paymentMethod } = req.body;
    const amount = PRICES.NEW_MEMBERSHIP; // Use the global price

    // Validate input
    if (!name || !email || !paymentMethod) {
        return res.status(400).json({ error: 'Name, email, and payment method are required' });
    }

    const customerQuery = `
        INSERT INTO Customer (name, email, membership_type, contact_info)
        VALUES ($1, $2, 'Member', $3) RETURNING customer_id;
    `;

    const membershipQuery = `
        INSERT INTO Membership (customer_id, start_date, end_date, status)
        VALUES ($1, $2, $3, $4) RETURNING membership_id;
    `;

    const paymentQuery = `
        INSERT INTO Payment (amount, method, status, payment_date, customer_id)
        VALUES ($1, $2, $3, $4, $5) RETURNING payment_id;
    `;

    let client;

    try {
        client = await pool.connect();
        await client.query('BEGIN');

        // Insert customer
        const customerResult = await client.query(customerQuery, [name, email, phone || null]);
        const customerId = customerResult.rows[0].customer_id;

        // Define start and end dates for the membership
        const startDate = new Date();
        const endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() + 1); // Set end date to one year from now

        // Insert membership and capture membershipId
        const membershipResult = await client.query(membershipQuery, [customerId, startDate, endDate, 'Active']);
        const membershipId = membershipResult.rows[0].membership_id; // Ensure this is defined

        // Insert payment
        const paymentStatus = 'Completed'; // Example status
        const paymentDate = new Date().toISOString(); // Current timestamp

        const paymentResult = await client.query(paymentQuery, [
            amount,
            paymentMethod,
            paymentStatus,
            paymentDate,
            customerId
        ]);

        // Commit the transaction
        await client.query('COMMIT');

        res.status(201).json({
            customerId: customerId,
            membershipId: membershipId, // Return the membershipId
            paymentId: paymentResult.rows[0].payment_id
        });
    } catch (error) {
        console.error('Error adding membership transaction:', error);
        if (client) {
            await client.query('ROLLBACK');
        }
        res.status(500).json({
            error: 'An error occurred while adding the membership transaction',
            details: error.message
        });
    } finally {
        if (client) {
            client.release();
        }
    }
});

app.post('/renewMembership', async (req, res) => {
    const { name, paymentMethod, referenceNumber } = req.body;
    const amount = PRICES.MEMBERSHIP; // Use global membership renewal price

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

        // Determine reference number based on payment method
        let gcashRefNum = null;
        let mayaRefNum = null;

        if (paymentMethod === 'Gcash') {
            gcashRefNum = referenceNumber;
        } else if (paymentMethod === 'Paymaya') {
            mayaRefNum = referenceNumber;
        }

        const paymentQuery = `
            INSERT INTO Payment (amount, method, status, payment_date, customer_id, membership_id, gcash_refNum, maya_refNum)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING payment_id;
        `;

        const paymentDate = new Date().toISOString().split('T')[0];
        const paymentStatus = 'Completed';

        // Insert payment record
        const paymentResult = await client.query(paymentQuery, [
            amount,
            paymentMethod,
            paymentStatus,
            paymentDate,
            customerId,
            membershipId,
            gcashRefNum,
            mayaRefNum
        ]);

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
        await client.query('ROLLBACK');
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
// Endpoint to get role counts
app.get('/getRoleCounts', async (req, res) => {
    try {
        // Query to get customer type counts
        const customerTypeQuery = `
            SELECT 
                membership_type, 
                COUNT(*) as count
            FROM 
                Customer
            GROUP BY 
                membership_type;
        `;

        // Query to get today's check-ins
        const todayCheckInsQuery = `
            SELECT COUNT(*) as today_check_ins
            FROM CheckIn
            WHERE DATE(check_in_time) = CURRENT_DATE;
        `;

        // Query to get active memberships
        const activeMembershipsQuery = `
            SELECT COUNT(*) as active_memberships
            FROM Membership
            WHERE status = 'Active';
        `;

        // Execute all queries
        const customerTypeResult = await pool.query(customerTypeQuery);
        const todayCheckInsResult = await pool.query(todayCheckInsQuery);
        const activeMembershipsResult = await pool.query(activeMembershipsQuery);

        // Prepare response
        const response = {
            walk_in_count: 0,
            member_count: 0,
            today_check_ins: parseInt(todayCheckInsResult.rows[0].today_check_ins),
            active_memberships: parseInt(activeMembershipsResult.rows[0].active_memberships)
        };

        // Process customer type counts
        customerTypeResult.rows.forEach(row => {
            if (row.membership_type === 'Walk In') {
                response.walk_in_count = parseInt(row.count);
            }
            if (row.membership_type === 'Member') {
                response.member_count = parseInt(row.count);
            }
        });

        res.status(200).json({
            success: true,
            data: response
        });

    } catch (error) {
        console.error('Error fetching role counts:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching role counts',
            details: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

/* ----------------- Function to insert check-in data(With Restrictions) ----------------- */
app.use(cors(corsConfig));
app.use(express.json());

// Function to fetch customer details based on membership_id
async function fetchCustomerDetails(membership_id) {
    try {
        // Fetch membership details
        const membershipResult = await pool.query('SELECT * FROM membership WHERE membership_id = $1', [membership_id]);
        if (membershipResult.rows.length === 0) {
            console.log('No membership found with the given ID');
            return null;
        }

        const membership = membershipResult.rows[0];
        const customerResult = await pool.query('SELECT * FROM customer WHERE customer_id = $1', [membership.customer_id]);
        if (customerResult.rows.length === 0) {
            console.log('No customer found with the given ID');
            return null;
        }

        const customer = customerResult.rows[0];

        // Combine customer and membership details
        return {
            ...customer,
            membership_id: membership.membership_id,
            start_date: membership.start_date,
            end_date: membership.end_date,
        };
    } catch (error) {
        console.error('Error fetching customer details:', error);
        throw error;
    }
}

// Endpoint to scan QR code and fetch customer details
app.post('/scan-qr', async (req, res) => {
    const { qrCodeValue } = req.body;
    try {
        const customerDetails = await fetchCustomerDetails(qrCodeValue);
        if (customerDetails) {
            res.status(200).json({ success: true, customerDetails });
        } else {
            res.status(404).json({ success: false, error: 'Customer not found' });
        }
    } catch (error) {
        console.error('Error in /scan-qr endpoint:', error);
        res.status(500).json({ success: false, error: 'Error fetching customer details', details: error.message });
    }
});

// Endpoint to handle check-in
app.post('/check-in', async (req, res) => {
    const { membership_id, customer_id } = req.body;
    try {
        // Insert check-in data
        const checkInResult = await insertCheckInData(membership_id, customer_id);
        if (checkInResult.success) {
            res.status(200).json({ success: true });
        } else {
            res.status(400).json({ success: false, error: checkInResult.error });
        }
    } catch (error) {
        console.error('Error in /check-in endpoint:', error);
        res.status(500).json({ success: false, error: 'Error inserting check-in data', details: error.message });
    }
});

// Function to insert check-in data
async function insertCheckInData(membership_id, customer_id) {
    try {
        // Get the current date and time in ISO 8601 format with timezone
        const check_in_time = new Date().toISOString();

        // Fetch membership details to check start_date and end_date
        const membershipResult = await pool.query('SELECT * FROM membership WHERE membership_id = $1', [membership_id]);
        if (membershipResult.rows.length === 0) {
            console.log('No membership found with the given ID');
            return { success: false, error: 'No membership found with the given ID' };
        }

        const membership = membershipResult.rows[0];
        const currentTime = new Date();

        // Check if the current time is within the membership period
        if (currentTime < new Date(membership.start_date) || currentTime > new Date(membership.end_date)) {
            console.log('Membership is not valid at the current time');
            return { success: false, error: 'Membership is not valid at the current time' };
        }

        // Check if a check-in has already been recorded for today
        const today = new Date().toISOString().split('T')[0];
        const checkInResult = await pool.query(
            'SELECT * FROM checkin WHERE customer_id = $1 AND membership_id = $2 AND DATE(check_in_time) = $3',
            [customer_id, membership_id, today]
        );

        if (checkInResult.rows.length > 0) {
            console.log('Check-in already recorded for today');
            return { success: false, error: 'Check-in already recorded for today' };
        }

        // Insert the check-in data into the checkin table
        await pool.query(
            'INSERT INTO checkin (customer_id, check_in_time, membership_id) VALUES ($1, $2, $3)',
            [customer_id, check_in_time, membership_id]
        );

        console.log('Check-in data inserted successfully');
        return { success: true };
    } catch (error) {
        console.error('Error inserting check-in data:', error);
        throw error;
    }
}

// Endpoint to fetch check-in count
app.get('/checkin-count', async (req, res) => {
    try {
        const result = await pool.query('SELECT COUNT(*) FROM checkin');
        const count = result.rows[0].count;
        res.status(200).json({ count });
    } catch (error) {
        console.error('Error fetching check-in count:', error);
        res.status(500).json({ error: 'Error fetching check-in count' });
    }
});
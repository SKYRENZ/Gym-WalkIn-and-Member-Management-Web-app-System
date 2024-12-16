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
  
      switch(period) {
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
  
      switch(period) {
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
  const { name, password, role, contact_info } = req.body;

  // Validate input
  if (!name || !password || !role) {
      return res.status(400).json({ error: 'Name, password, and role are required' });
  }

  // Validate role
  if (!['receptionist', 'admin'].includes(role.toLowerCase())) {
      return res.status(400).json({ error: 'Invalid role. Must be either "receptionist" or "admin"' });
  }

  try {
      const client = await pool.connect();

      // Check if staff with same name already exists
      const existingStaffQuery = 'SELECT * FROM Staff WHERE name = $1';
      const existingStaffResult = await client.query(existingStaffQuery, [name]);

      if (existingStaffResult.rows.length > 0) {
          client.release();
          return res.status(409).json({ error: 'An account with this name already exists' });
      }

      // Insert new staff account
      const insertStaffQuery = `
          INSERT INTO Staff (name, role, password, contact_info) 
          VALUES ($1, $2, $3, $4) 
          RETURNING staff_id;
      `;

      const result = await client.query(insertStaffQuery, [
          name, 
          role.toLowerCase(), 
          password, // In a real-world scenario, hash the password
          contact_info || null // Optional contact info
      ]);

      client.release();

      res.status(201).json({ 
          message: 'Staff account created successfully', 
          staffId: result.rows[0].staff_id 
      });

  } catch (error) {
      console.error('Error adding staff:', error);
      res.status(500).json({ error: 'Error creating staff account', details: error.message });
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
    SELECT * FROM Staff WHERE password = $1;
  `;

  let client;

  try {
    client = await pool.connect();
    const result = await client.query(loginQuery, [password]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const staffMember = result.rows[0];

    // Log the staff member details for debugging
    console.log('Staff Member Details:', {
      id: staffMember.staff_id,
      name: staffMember.name,
      role: staffMember.role
    });

    // Check the role and respond accordingly
    if (staffMember.role === 'admin') {
      res.status(200).json({ 
        message: 'Admin login successful', 
        staff: {
          staff_id: staffMember.staff_id,
          name: staffMember.name,
          role: 'admin'
        }
      });
    } else if (staffMember.role === 'receptionist') {
      res.status(200).json({ 
        message: 'Receptionist login successful', 
        staff: {
          staff_id: staffMember.staff_id,
          name: staffMember.name,
          role: 'receptionist'
        }
      });
    } else {
      // If role is neither admin nor receptionist
      return res.status(403).json({ 
        error: 'Access denied. Invalid role.',
        details: `Current role: ${staffMember.role}`
      });
    }

  } catch (err) {
    console.error('Error during staff login:', err);
    res.status(500).json({ error: 'Error during staff login' });
  } finally {
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

// Endpoint to get all staff accounts
app.get('/getStaffAccounts', async (req, res) => { 
  try { 
      const client = await pool.connect(); 

      const query = ` 
          SELECT 
              staff_id, 
              name, 
              role, 
              contact_info,
              status
          FROM Staff 
          WHERE status = 'Active'
          ORDER BY name 
      `; 

      const result = await client.query(query); 
      client.release(); 

      res.status(200).json(result.rows); 
  } catch (error) { 
      console.error('Error fetching staff accounts:', error); 
      console.error('Full error details:', error.message); // Add more detailed logging
      res.status(500).json({ 
          error: 'Error retrieving staff accounts', 
          details: error.message 
      }); 
  } 
}); 

// Endpoint to update staff account
app.put('/updateStaff/:staffId', async (req, res) => {
  const { staffId } = req.params;
  const { name, role, contact_info, password } = req.body;

  // Validate input
  if (!name || !role) {
      return res.status(400).json({ error: 'Name and role are required' });
  }

  // Validate role
  if (!['receptionist', 'admin'].includes(role.toLowerCase())) {
      return res.status(400).json({ error: 'Invalid role. Must be either "receptionist" or "admin"' });
  }

  try {
      const client = await pool.connect();

      // Prepare the update query
      let query = `
          UPDATE Staff 
          SET name = $1, 
              role = $2, 
              contact_info = $3
      `;
      const queryParams = [name, role, contact_info || null];

      // Add password update if provided
      if (password) {
          query += `, password = $${queryParams.length + 1}`;
          queryParams.push(password); // In production, hash the password
      }

      query += ` WHERE staff_id = $${queryParams.length + 1} RETURNING *`;
      queryParams.push(staffId);

      // Execute the update
      const result = await client.query(query, queryParams);

      client.release();

      // Check if the account was found and updated
      if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Staff account not found' });
      }

      res.status(200).json({ 
          message: 'Staff account updated successfully', 
          staff: result.rows[0] 
      });

  } catch (error) {
      console.error('Error updating staff:', error);
      
      // Handle specific error cases
      if (error.code === '23505') { // Unique constraint violation
          return res.status(409).json({ error: 'An account with this name already exists' });
      }

      res.status(500).json({ 
          error: 'Error updating staff account', 
          details: error.message 
      });
  }
});

// Endpoint to get deactivated staff accounts
app.get('/getDeactivatedStaffAccounts', async (req, res) => { 
  try { 
      const client = await pool.connect(); 

      const query = ` 
          SELECT 
              staff_id, 
              name, 
              role, 
              contact_info,
              deactivated_at
          FROM Staff 
          WHERE status = 'Inactive'
          ORDER BY deactivated_at DESC 
      `; 

      const result = await client.query(query); 
      client.release(); 

      res.status(200).json(result.rows); 
  } catch (error) { 
      console.error('Error fetching deactivated staff accounts:', error); 
      res.status(500).json({ 
          error: 'Error retrieving deactivated staff accounts', 
          details: error.message 
      }); 
  } 
}); 
// Endpoint to get deactivated staff accounts
app.put('/deactivateStaff/:staffId', async (req, res) => { 
  const { staffId } = req.params; 

  try { 
      const client = await pool.connect(); 

      // Update query to set account as inactive and record deactivation time
      const deactivateQuery = ` 
          UPDATE Staff 
          SET 
              status = 'Inactive', 
              deactivated_at = CURRENT_TIMESTAMP 
          WHERE staff_id = $1 
          RETURNING *; 
      `; 

      const result = await client.query(deactivateQuery, [staffId]); 

      client.release(); 

      // Check if the account was found and updated 
      if (result.rows.length === 0) { 
          return res.status(404).json({ error: 'Staff account not found' }); 
      } 

      res.status(200).json({ 
          message: 'Staff account deactivated successfully', 
          staff: result.rows[0] 
      }); 

  } catch (error) { 
      console.error('Error deactivating staff:', error); 
      res.status(500).json({ 
          error: 'Error deactivating staff account', 
          details: error.message 
      }); 
  } 
}); 

// Endpoint to reactivate a staff account
app.put('/reactivateStaff/:staffId', async (req, res) => {
  const { staffId } = req.params;

  let client;
  try {
      client = await pool.connect();

      // Check if the account is currently inactive
      const checkQuery = `
          SELECT * FROM Staff 
          WHERE staff_id = $1 AND status = 'Inactive';
      `;
      const checkResult = await client.query(checkQuery, [staffId]);

      if (checkResult.rows.length === 0) {
          return res.status(404).json({ 
              error: 'Account not found or already active' 
          });
      }

      // Reactivate the account
      const reactivateQuery = `
          UPDATE Staff 
          SET 
              status = 'Active', 
              deactivated_at = NULL 
          WHERE staff_id = $1 
          RETURNING *;
      `;

      const result = await client.query(reactivateQuery, [staffId]);

      res.status(200).json({ 
          message: 'Staff account reactivated successfully', 
          staff: result.rows[0] 
      });

  } catch (error) {
      console.error('Error reactivating staff:', error);
      res.status(500).json({ 
          error: 'Error reactivating staff account', 
          details: error.message 
      });
  } finally {
      if (client) {
          client.release();
      }
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
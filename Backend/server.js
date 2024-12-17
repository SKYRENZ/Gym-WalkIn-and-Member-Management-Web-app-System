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
const ReportService = require('./services/reportService');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');


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
  //counter
  //transaction log
  app.get('/getTransactionLogs', async (req, res) => {
    try {
      const transactionLogs = await ReportService.getTransactionLogs();
      res.status(200).json({
        success: true,
        data: transactionLogs
      });
    } catch (error) {
      console.error('Error in /getTransactionLogs:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch transaction logs'
      });
    }
  });
  //walkincard

app.get('/today-walkin-count', async (req, res) => {
  try {
      const query = `
          SELECT COUNT(DISTINCT c.name) AS count
          FROM Payment p
          JOIN Customer c ON p.customer_id = c.customer_id
          WHERE 
              c.membership_type = 'Walk In' 
              AND DATE(p.payment_date AT TIME ZONE 'Asia/Manila') = CURRENT_DATE;
      `;

      const result = await pool.query(query);
      
      res.status(200).json({
          count: parseInt(result.rows[0].count) || 0
      });
  } catch (error) {
      console.error('Error fetching today\'s walk-in count:', error);
      res.status(500).json({ 
          count: 0,
          error: 'Failed to fetch walk-in count' 
      });
  }
});
//membercard
app.get('/getNewMembers', async (req, res) => {
  const { startDate } = req.query;

  try {
      const query = `
          SELECT COUNT(DISTINCT c.customer_id) AS count
          FROM Customer c
          JOIN Membership m ON c.customer_id = m.customer_id
          WHERE 
              c.membership_type = 'Member'
              AND m.start_date >= $1;
      `;

      const result = await pool.query(query, [startDate]);

      res.status(200).json({
          count: parseInt(result.rows[0].count) || 0
      });
  } catch (error) {
      console.error('Error fetching new members:', error);
      res.status(500).json({
          count: 0,
          error: 'Failed to fetch new members'
      });
  }
});

//admin
//customer Tracking
app.get('/customerTracking', async (req, res) => {
  const { date } = req.query;

  console.log('Received Date (Raw):', date);
  console.log('Received Date (Parsed):', new Date(date));

  try {
    if (!date) { 
      return res.status(400).json({ 
        success: false, 
        error: 'Date is required' 
      }); 
    } 

    const trackingData = await ReportService.getCustomerTrackingData(date);

    res.status(200).json({ 
      success: true, 
      data: trackingData 
    }); 
  } catch (error) { 
    console.error('Full Customer Tracking Error:', error); 
    res.status(500).json({ 
      success: false, 
      error: 'Error fetching customer tracking data', 
      details: error.message 
    }); 
  } 
});

//member counting
app.get('/getWalkin&MemberCounting', async (req, res) => {
  const { year, period = 'monthly', type } = req.query;

  // Validate year 
  const currentYear = new Date().getFullYear();
  const parsedYear = parseInt(year, 10);

  // Validate input 
  if (isNaN(parsedYear) || parsedYear < 2000 || parsedYear > currentYear + 1) {
    return res.status(400).json({ 
      error: 'Invalid year', 
      message: `Please provide a valid year between 2000 and ${currentYear + 1}` 
    });
  }

  // Validate type 
  if (!['Walk In', 'Member'].includes(type)) {
    return res.status(400).json({ 
      error: 'Invalid type', 
      message: 'Type must be either "Walk In" or "Member"' 
    });
  }

  try {
    let query;

    if (type === 'Walk In') {
      // Query to get unique walk-in customers per month
      query = ` 
        WITH UniqueWalkIns AS (
          SELECT 
            EXTRACT(MONTH FROM p.payment_date) AS month,
            c.name
          FROM 
            Payment p 
          JOIN 
            Customer c ON p.customer_id = c.customer_id 
          WHERE 
            c.membership_type = 'Walk In' 
            AND EXTRACT(YEAR FROM p.payment_date) = $1 
          GROUP BY 
            EXTRACT(MONTH FROM p.payment_date),
            c.name
        )
        SELECT 
          month, 
          COUNT(DISTINCT name) AS total_entries,
          SUM(entries) AS total_actual_entries
        FROM 
          (
            SELECT 
              month, 
              name, 
              COUNT(*) AS entries
            FROM 
              UniqueWalkIns
            GROUP BY 
              month, 
              name
          ) AS MonthlyCustomerEntries
        GROUP BY 
          month
        ORDER BY 
          month;
      `;
    } else {
      // Query for Member registrations using membership ID
      query = ` 
        SELECT 
          EXTRACT(MONTH FROM m.start_date) AS month, 
          COUNT(DISTINCT m.membership_id) AS total_entries
        FROM 
          Membership m 
        JOIN 
          Customer c ON m.customer_id = c.customer_id 
        WHERE 
          c.membership_type = 'Member' 
          AND EXTRACT(YEAR FROM m.start_date) = $1 
        GROUP BY 
          EXTRACT(MONTH FROM m.start_date) 
        ORDER BY 
          month;
      `;
    }

    const result = await pool.query(query, [parsedYear]);

    // Prepare response
    const responseData = {
      success: true,
      data: result.rows.map(row => ({
        month: parseInt(row.month),
        total_entries: parseInt(row.total_entries),
        ...(row.total_actual_entries && { total_actual_entries: parseInt(row.total_actual_entries) })
      })),
      metadata: {
        year: parsedYear,
        period: period,
        type: type,
        total_entries: result.rows.reduce((sum, row) => sum + parseInt(row.total_entries), 0),
        ...(result.rows[0]?.total_actual_entries && {
          total_actual_entries: result.rows.reduce((sum, row) => sum + parseInt(row.total_actual_entries), 0)
        })
      }
    };

    res.status(200).json(responseData);
  } catch (err) {
    console.error('Error fetching membership counting records:', err);
    res.status(500).json({ 
      success: false,
      error: 'Error fetching membership counting records', 
      details: err.message 
    });
  }
});

// customer records
app.get('/getWalkInCustomerRecords', async (req, res) => {
  const { year, period = 'monthly' } = req.query;

  console.log('Received parameters:', { year, period });

  try {
    const result = await ReportService.getWalkInCustomerRecords(year, period);
    
    console.log('Route result:', result);

    res.status(200).json(result);
  } catch (err) {
    console.error('Error in route:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Error fetching walk-in customer records', 
      details: err.message 
    });
  }
});
app.get('/getMemberCustomerRecords', async (req, res) => {
    const client = await pool.connect();
  
    try {
      const { year, period = 'monthly' } = req.query;
      const parsedYear = parseInt(year, 10);
  
      console.log('Received year for member records:', parsedYear);
  
      const query = ` 
        SELECT 
          c.name,
          COUNT(p.payment_id) AS total_entries,
          MAX(p.payment_date) AS last_payment_date
        FROM 
          Customer c
        JOIN 
          Membership m ON c.customer_id = m.customer_id
        LEFT JOIN 
          Payment p ON c.customer_id = p.customer_id
        WHERE 
          c.membership_type = 'Member' 
          AND EXTRACT(YEAR FROM p.payment_date) = $1 
        GROUP BY 
          c.name
        ORDER BY 
          total_entries DESC;
      `; 
  
      console.log('Executing query with year:', parsedYear);
  
      const result = await client.query(query, [parsedYear]);
  
      console.log('Query result:', result.rows);
  
      const processedData = result.rows.map(row => ({
        names: row.name || 'Unknown',
        total_entries: parseInt(row.total_entries) || 0,
        last_payment_date: row.last_payment_date 
          ? new Date(row.last_payment_date).toLocaleDateString('en-PH') 
          : 'N/A'
      }));
  
      console.log('Processed data:', processedData);
  
      res.status(200).json({
        success: true,
        data: processedData,
        metadata: {
          year: parsedYear,
          period: period,
          total_entries: processedData.reduce((sum, entry) => sum + entry.total_entries, 0)
        }
      });
    } catch (error) {
      console.error('Error fetching member customer records:', error);
      res.status(500).json({
        success: false,
        error: 'Error fetching member customer records',
        details: error.message
      });
    } finally {
      client.release();
    }
  });
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
app.get('/getCustomerPaymentRecords/:name', async (req, res) => {
    const { name } = req.params;
  
    const paymentRecordsQuery = `
      SELECT 
        p.amount, 
        p.method, 
        p.payment_date
      FROM 
        Payment p
      JOIN 
        Customer c ON p.customer_id = c.customer_id
      WHERE 
        c.name = $1
      ORDER BY 
        p.payment_date DESC;
    `;
  
    let client;
  
    try {
      client = await pool.connect();
      const result = await client.query(paymentRecordsQuery, [name]);
  
      res.status(200).json(result.rows);
    } catch (err) {
      console.error('Error fetching payment records:', err);
      res.status(500).json({ 
        error: 'Error fetching payment records', 
        details: err.message 
      });
    } finally {
      if (client) client.release();
    }
  });
// Endpoint to get customer membership info
app.get('/getCustomerMember_info/:name', async (req, res) => {
    const { name } = req.params;

    const customerQuery = `
        SELECT 
            c.name, 
            c.email, 
            c.contact_info AS phone, 
            m.end_date
        FROM 
            Customer c
        JOIN 
            Membership m ON c.customer_id = m.customer_id
        WHERE 
            c.name = $1
        LIMIT 1;
    `;

    let client;

    try {
        client = await pool.connect();
        const result = await client.query(customerQuery, [name]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching customer membership:', err);
        res.status(500).json({ 
            error: 'Error fetching customer membership', 
            details: err.message 
        });
    } finally {
        if (client) {
            client.release();
        }
    }
});
// Endpoint to update customer information
app.put('/updateCustomerInfo/:name', async (req, res) => {
    const { name } = req.params;
    const { name: newName, email, phone, membership_end_date } = req.body;

    let client;

    try {
        client = await pool.connect();

        // Start a transaction
        await client.query('BEGIN');

        // Update customer information
        const updateCustomerQuery = `
            UPDATE Customer c
            SET 
                name = $1, 
                email = $2, 
                contact_info = $3
            FROM Membership m
            WHERE c.customer_id = m.customer_id AND c.name = $4
            RETURNING c.customer_id;
        `;

        const customerResult = await client.query(updateCustomerQuery, [
            newName, 
            email, 
            phone, 
            name
        ]);

        if (customerResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Customer not found' });
        }

        const customerId = customerResult.rows[0].customer_id;

        // Update membership end date if provided
        if (membership_end_date) {
            const updateMembershipQuery = `
                UPDATE Membership
                SET end_date = $1
                WHERE customer_id = $2;
            `;

            await client.query(updateMembershipQuery, [
                membership_end_date, 
                customerId
            ]);
        }

        // Commit the transaction
        await client.query('COMMIT');

        res.status(200).json({ 
            message: 'Customer information updated successfully',
            customer_id: customerId
        });
    } catch (err) {
        // Rollback the transaction in case of error
        if (client) {
            await client.query('ROLLBACK');
        }

        console.error('Error updating customer information:', err);
        res.status(500).json({ 
            error: 'Error updating customer information', 
            details: err.message 
        });
    } finally {
        if (client) {
            client.release();
        }
    }
});

//income summary
app.get('/getIncomeSummary', async (req, res) => {
  const { year, period, date } = req.query;

  try {
      const incomeSummary = await ReportService.getIncomeSummaryData(
          year, 
          period, 
          period === 'daily' ? date : null
      );
      res.status(200).json({ success: true, data: incomeSummary });
  } catch (error) {
      console.error('Error fetching income summary:', error);
      res.status(500).json({ success: false, error: 'Error fetching income summary' });
  }
});
//qr

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
  const amount = PRICES.WALK_IN;

  // Validate input 
  if (!name || !paymentMethod) { 
    return res.status(400).json({ error: 'Name and payment method are required' }); 
  } 

  const customerQuery = ` 
    INSERT INTO Customer (name, contact_info, membership_type)
    VALUES ($1, $2, 'Walk In')
    RETURNING customer_id;
  `; 

  const paymentQuery = ` 
    INSERT INTO Payment (amount, method, status, payment_date, customer_id, gcash_refNum, maya_refNum) 
    VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4, $5, $6) 
    RETURNING payment_id; 
  `; 

  let client; 

  try { 
    client = await pool.connect(); 
    await client.query('BEGIN'); 

    // Insert customer 
    const customerResult = await client.query(customerQuery, [ 
      name, 
      phone || null 
    ]); 
    const customerId = customerResult.rows[0].customer_id; 

    const paymentStatus = 'Completed'; 

    // Determine reference number based on payment method 
    let gcashRefNum = null; 
    let mayaRefNum = null; 

    if (paymentMethod === 'Gcash') { 
      gcashRefNum = referenceNumber; 
    } else if (paymentMethod === 'Paymaya') { 
      mayaRefNum = referenceNumber; 
    } 

    // Insert payment 
    const paymentResult = await client.query(paymentQuery, [ 
      amount, 
      paymentMethod, 
      paymentStatus, 
      customerId, 
      gcashRefNum, 
      mayaRefNum 
    ]); 

    await client.query('COMMIT'); 

    res.status(201).json({ 
      customerId: customerId, 
      paymentId: paymentResult.rows[0].payment_id, 
      message: 'Walk-in transaction added successfully' 
    }); 
  } catch (err) { 
    if (client) await client.query('ROLLBACK'); 

    console.error('Error adding walk-in transaction:', err); 
    res.status(500).json({ 
      error: 'Error adding walk-in transaction', 
      details: err.message 
    }); 
  } finally { 
    if (client) client.release(); 
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
      INSERT INTO Membership (customer_id, start_date, end_date, status, qr_code_path) 
      VALUES ($1, $2, $3, $4, $5) RETURNING membership_id; 
  `; 

  const paymentQuery = ` 
      INSERT INTO Payment (amount, method, status, payment_date, customer_id, membership_id) 
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING payment_id; 
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
      endDate.setMonth(endDate.getMonth() + 1); // Set end date to 1 month from now

      // Prepare QR code directories
      const backendQRCodeDir = path.join(__dirname, 'qrcodes');
      const frontendQRCodeDir = path.join(__dirname, '..', 'frontend', 'public', 'images', 'qrcodes');

      // Ensure directories exist
      [backendQRCodeDir, frontendQRCodeDir].forEach(dir => {
          if (!fs.existsSync(dir)) {
              fs.mkdirSync(dir, { recursive: true });
          }
      });

      // Generate QR code
      const generateQRCode = async (membershipId) => {
          const backendQRCodePath = path.join(backendQRCodeDir, `${membershipId}.png`);
          const frontendQRCodePath = path.join(frontendQRCodeDir, `${membershipId}.png`);

          try {
              // Generate QR code for both backend and frontend
              await QRCode.toFile(backendQRCodePath, membershipId.toString());
              await QRCode.toFile(frontendQRCodePath, membershipId.toString());
              return backendQRCodePath;
          } catch (error) {
              console.error('Error generating QR code:', error);
              throw error;
          }
      };

      // Insert membership and capture membershipId 
      const membershipResult = await client.query(membershipQuery, [
          customerId, 
          startDate, 
          endDate, 
          'Active',
          null // Placeholder for QR code path
      ]); 
      const membershipId = membershipResult.rows[0].membership_id;

      // Generate QR code and update membership with QR code path
      const qrCodePath = await generateQRCode(membershipId);

      // Update membership with QR code path
      await client.query(`
          UPDATE Membership 
          SET qr_code_path = $1 
          WHERE membership_id = $2
      `, [qrCodePath, membershipId]);

      // Insert payment 
      const paymentStatus = 'Completed'; 
      const paymentDate = new Date().toISOString(); 

      const paymentResult = await client.query(paymentQuery, [ 
          amount, 
          paymentMethod, 
          paymentStatus, 
          paymentDate, 
          customerId, 
          membershipId 
      ]); 

      // Commit the transaction 
      await client.query('COMMIT'); 

      res.status(201).json({ 
          customerId: customerId, 
          membershipId: membershipId, 
          paymentId: paymentResult.rows[0].payment_id,
          qrCodePath: `/images/qrcodes/${membershipId}.png` // Frontend-relative path
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

// Endpoint to fetch members
app.get('/members', async (req, res) => {
  try {
      const result = await pool.query(`
          SELECT m.membership_id, c.name 
          FROM membership m
          JOIN customer c ON m.customer_id = c.customer_id
      `);
      res.status(200).json(result.rows);
  } catch (error) {
      console.error('Error fetching members:', error);
      res.status(500).json({ error: 'Error fetching members' });
  }
});
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


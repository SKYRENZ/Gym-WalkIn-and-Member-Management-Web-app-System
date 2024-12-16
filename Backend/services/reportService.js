// services/reportService.js
const pool = require('../db');

class ReportService {
  // Customer Tracking Service Method
  static async getCustomerTrackingData(date) {
    try {
      console.log('Fetching tracking data for date:', date);
  
      // Validate date input
      if (!date) {
        throw new Error('Date parameter is required');
      }
  
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
          DATE(ci.check_in_time AT TIME ZONE 'Asia/Manila') = DATE($1 AT TIME ZONE 'Asia/Manila')
  
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
          AND DATE(p.payment_date AT TIME ZONE 'Asia/Manila') = DATE($1 AT TIME ZONE 'Asia/Manila')
  
        UNION ALL 
  
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
  
      const result = await pool.query(trackingQuery, [date]);
  
      console.log('Raw tracking data:', result.rows);
  
      const processedData = result.rows.map(row => ({
        name: row.name,
        timestamp: row.timestamp ? 
          new Date(row.timestamp).toLocaleTimeString('en-PH', { 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: true, 
            timeZone: 'Asia/Manila' 
          }) : 
          null,
        role: row.role,
        payment: row.payment
      }));
  
      console.log('Processed tracking data:', processedData);
  
      return processedData;
    } catch (error) {
      console.error('Error in getCustomerTrackingData:', error);
      throw error;
    }
  }

  // Member Counting Service Method
  static async getMemberCountData(year, period = 'monthly', type) {
    try {
      let query;
      
      if (type === 'Walk In') {
        query = ` 
          SELECT 
            EXTRACT(MONTH FROM p.payment_date) AS month,
            COUNT(DISTINCT c.name) AS total_entries
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
      } else if (type === 'Member') {
        query = ` 
          SELECT 
            EXTRACT(MONTH FROM m.start_date) AS month,
            COUNT(DISTINCT c.name) AS total_entries
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
      } else {
        throw new Error('Invalid type. Must be "Walk In" or "Member".');
      }
  
      const result = await pool.query(query, [year]);
  
      return result.rows.map(row => ({
        month: row.month,
        total_entries: parseInt(row.total_entries)
      }));
    } catch (error) {
      console.error('Error in getMemberCountData:', error);
      throw error;
    }
  }

  // Income Summary Service Method
  static async getIncomeSummaryData(year, period = 'monthly', type) {
    const query = `
      SELECT 
        EXTRACT(MONTH FROM p.payment_date) AS month,
        COUNT(p.payment_id) AS total_entries,
        SUM(p.amount) AS total_income
      FROM 
        Payment p
      JOIN 
        Customer c ON p.customer_id = c.customer_id
      WHERE 
        c.membership_type = $1
        AND EXTRACT(YEAR FROM p.payment_date) = $2
      GROUP BY 
        EXTRACT(MONTH FROM p.payment_date)
      ORDER BY 
        month;
    `;

    const result = await pool.query(query, [type, year]);
    return result.rows.map(row => ({
      month: row.month,
      total_entries: parseInt(row.total_entries),
      total_income: parseFloat(row.total_income)
    }));
  }

// In reportService.js
static async getWalkInCustomerRecords(year, period = 'monthly') {
  try {
    const currentYear = new Date().getFullYear();
    const parsedYear = parseInt(year, 10);

    if (isNaN(parsedYear) || parsedYear < 2000 || parsedYear > currentYear + 1) {
      throw new Error(`Please provide a valid year between 2000 and ${currentYear + 1}`);
    }

    const query = ` 
      SELECT 
        c.name,
        COUNT(*) AS total_entries,
        MAX(p.payment_date) AS last_payment_date
      FROM 
        Payment p 
      JOIN 
        Customer c ON p.customer_id = c.customer_id 
      WHERE 
        c.membership_type = 'Walk In' 
        AND EXTRACT(YEAR FROM p.payment_date) = $1 
      GROUP BY 
        c.name
      ORDER BY 
        total_entries DESC;
    `; 

    const result = await pool.query(query, [parsedYear]);

    const processedData = result.rows.map(row => ({
      names: row.name,
      total_entries: parseInt(row.total_entries),
      last_payment_date: row.last_payment_date ? new Date(row.last_payment_date).toLocaleDateString('en-PH') : 'N/A'
    }));

    return { 
      success: true, 
      data: processedData,
      metadata: { 
        year: parsedYear, 
        period: period, 
        total_entries: processedData.reduce((sum, entry) => sum + entry.total_entries, 0)
      } 
    };
  } catch (err) {
    console.error('Error fetching walk-in customer records:', err);
    throw err;
  }
}
static async getMemberCustomerRecords(year, period = 'monthly') {
  try {
    const currentYear = new Date().getFullYear();
    const parsedYear = parseInt(year, 10);

    if (isNaN(parsedYear) || parsedYear < 2000 || parsedYear > currentYear + 1) {
      throw new Error(`Please provide a valid year between 2000 and ${currentYear + 1}`);
    }

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

    const result = await pool.query(query, [parsedYear]);

    const processedData = result.rows.map(row => ({
      names: row.name || 'Unknown',
      total_entries: parseInt(row.total_entries) || 0,
      last_payment_date: row.last_payment_date 
        ? new Date(row.last_payment_date).toLocaleDateString('en-PH') 
        : 'N/A'
    }));

    return { 
      success: true, 
      data: processedData,
      metadata: { 
        year: parsedYear, 
        period: period, 
        total_entries: processedData.reduce((sum, entry) => sum + entry.total_entries, 0)
      } 
    };
  } catch (err) {
    console.error('Error fetching member customer records:', err);
    throw err;
  }
}
}

module.exports = ReportService;
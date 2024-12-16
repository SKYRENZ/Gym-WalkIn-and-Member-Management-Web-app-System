// services/reportService.js
const pool = require('../db');

class ReportService {
  // Customer Tracking Service Method
  static async getCustomerTrackingData(date) {
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
    return result.rows.map(row => ({
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

    // Detailed query with explicit date extraction
    let query = ` 
      SELECT 
        DISTINCT 
        (p.payment_date AT TIME ZONE 'Asia/Manila')::DATE AS exact_date,
        EXTRACT(YEAR FROM p.payment_date AT TIME ZONE 'Asia/Manila') AS payment_year,
        EXTRACT(MONTH FROM p.payment_date AT TIME ZONE 'Asia/Manila') AS payment_month,
        EXTRACT(DAY FROM p.payment_date AT TIME ZONE 'Asia/Manila') AS payment_day,
        c.name,
        COUNT(*) AS total_entries,
        SUM(p.amount) AS total_income
      FROM 
        Payment p 
      JOIN 
        Customer c ON p.customer_id = c.customer_id 
      WHERE 
        c.membership_type = 'Walk In' 
        AND EXTRACT(YEAR FROM p.payment_date AT TIME ZONE 'Asia/Manila') = $1 
      GROUP BY 
        exact_date,
        payment_year,
        payment_month,
        payment_day,
        c.name
      ORDER BY 
        exact_date, c.name;
    `; 

    console.log('Executing query with year:', year);

    const result = await pool.query(query, [year]);

    console.log('Raw result rows:', result.rows);

    // Manually group results to ensure unique dates
    const groupedResults = result.rows.reduce((acc, row) => {
      // Create a consistent date string
      const dateKey = `${row.payment_year}-${String(row.payment_month).padStart(2, '0')}-${String(row.payment_day).padStart(2, '0')}`;

      if (!acc[dateKey]) {
        acc[dateKey] = {
          date: dateKey,
          total_entries: 0,
          total_income: 0,
          names: []
        };
      }
      
      acc[dateKey].total_entries += parseInt(row.total_entries);
      acc[dateKey].total_income += parseFloat(row.total_income);
      
      // Add unique names if not already present
      if (!acc[dateKey].names.includes(row.name)) {
        acc[dateKey].names.push(row.name);
      }

      return acc;
    }, {});

    // Convert grouped results to array
    const processedData = Object.values(groupedResults).map(entry => ({
      date: entry.date,
      total_entries: entry.total_entries,
      total_income: entry.total_income,
      names: entry.names.join(', ')
    }));

    console.log('Processed data:', processedData);

    return { 
      success: true, 
      data: processedData,
      metadata: { 
        year: parsedYear, 
        period: period, 
        total_income: processedData.reduce((sum, entry) => sum + entry.total_income, 0),
        total_entries: processedData.reduce((sum, entry) => sum + entry.total_entries, 0)
      } 
    };
  } catch (err) {
    console.error('Error fetching walk-in customer records:', err);
    throw err;
  }
}


}

module.exports = ReportService;
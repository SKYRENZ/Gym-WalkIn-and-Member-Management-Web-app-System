// services/reportService.js
const pool = require('../db');

class ReportService {
  // Customer Tracking Service Method
// services/reportService.js
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
          JOIN 
              Payment p ON c.customer_id = p.customer_id 
          WHERE 
              c.membership_type = 'Walk In' 
              AND DATE(p.payment_date AT TIME ZONE 'Asia/Manila') = DATE($1 AT TIME ZONE 'Asia/Manila')
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
  static async getIncomeSummaryData(year, period, date = null) {
    const yearFilter = parseInt(year);

    let paymentQuery;
    let queryParams;

    if (period === 'monthly') {
        paymentQuery = `
            SELECT 
                EXTRACT(MONTH FROM payment_date) AS period,
                SUM(CASE WHEN c.membership_type = 'Walk In' THEN amount ELSE 0 END) AS walk_in_income,
                SUM(CASE WHEN c.membership_type = 'Member' THEN amount ELSE 0 END) AS member_income
            FROM 
                Payment p
            JOIN 
                Customer c ON p.customer_id = c.customer_id
            WHERE 
                EXTRACT(YEAR FROM payment_date) = $1
            GROUP BY 
                period
            ORDER BY 
                period
        `;
        queryParams = [yearFilter];
    } else {
        // Daily income for a specific date or current date
        const targetDate = date ? new Date(date) : new Date();
        paymentQuery = `
            SELECT 
                DATE(payment_date) AS period,
                SUM(CASE WHEN c.membership_type = 'Walk In' THEN amount ELSE 0 END) AS walk_in_income,
                SUM(CASE WHEN c.membership_type = 'Member' THEN amount ELSE 0 END) AS member_income
            FROM 
                Payment p
            JOIN 
                Customer c ON p.customer_id = c.customer_id
            WHERE 
                DATE(payment_date) = $1
            GROUP BY 
                period
        `;
        queryParams = [targetDate.toISOString().split('T')[0]];
    }

    const result = await pool.query(paymentQuery, queryParams);

    // Process the result
    const walkInIncomeByPeriod = period === 'monthly' 
        ? Array(12).fill(0).reduce((acc, _, index) => {
            acc[index + 1] = 0;
            return acc;
        }, {})
        : {};

    const memberIncomeByPeriod = period === 'monthly'
        ? Array(12).fill(0).reduce((acc, _, index) => {
            acc[index + 1] = 0;
            return acc;
        }, {})
        : {};

    let totalWalkInIncome = 0;
    let totalMemberIncome = 0;

    result.rows.forEach(row => {
        const period = row.period;
        walkInIncomeByPeriod[period] = parseFloat(row.walk_in_income);
        memberIncomeByPeriod[period] = parseFloat(row.member_income);
        totalWalkInIncome += parseFloat(row.walk_in_income);
        totalMemberIncome += parseFloat(row.member_income);
    });

    return {
        walkInIncomeByPeriod,
        memberIncomeByPeriod,
        totalWalkInIncome,
        totalMemberIncome,
        totalIncome: totalWalkInIncome + totalMemberIncome
    };
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

// In reportService.js or server.js
static async getTransactionLogs() {
  try {
    const query = `
      SELECT 
        c.name,
        CASE 
          WHEN c.membership_type = 'Walk In' THEN 'Walk-In Transaction'
          WHEN c.membership_type = 'Member' THEN 
            CASE 
              WHEN m.start_date IS NOT NULL THEN 'New Membership'
              ELSE 'Membership Renewal'
            END
        END AS transaction_type,
        p.method AS payment_method,
        p.payment_date AS transaction_date,
        p.amount
      FROM 
        Payment p
      JOIN 
        Customer c ON p.customer_id = c.customer_id
      LEFT JOIN 
        Membership m ON c.customer_id = m.customer_id AND m.start_date = p.payment_date
      ORDER BY 
        p.payment_date DESC
      LIMIT 100;
    `;

    const result = await pool.query(query);

    return result.rows.map(row => ({
      name: row.name,
      transaction_type: row.transaction_type,
      payment_method: row.payment_method,
      transaction_date: new Date(row.transaction_date).toLocaleString('en-PH', {
        dateStyle: 'short',
        timeStyle: 'short',
        timeZone: 'Asia/Manila'
      }),
      amount: parseFloat(row.amount).toFixed(2)
    }));
  } catch (error) {
    console.error('Error fetching transaction logs:', error);
    throw error;
  }
}
}


module.exports = ReportService;
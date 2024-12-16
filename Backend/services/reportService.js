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
  static async getMemberCountData(year, period = 'monthly') {
    const query = `
      SELECT 
        EXTRACT(MONTH FROM m.start_date) AS month,
        COUNT(*) AS total_entries
      FROM 
        Membership m
      JOIN 
        Customer c ON m.customer_id = c.customer_id
      WHERE 
        EXTRACT(YEAR FROM m.start_date) = $1
        AND c.membership_type = 'Member'
      GROUP BY 
        EXTRACT(MONTH FROM m.start_date)
      ORDER BY 
        month;
    `;

    const result = await pool.query(query, [year]);
    return result.rows.map(row => ({
      month: row.month,
      total_entries: parseInt(row.total_entries)
    }));
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
}

module.exports = ReportService;
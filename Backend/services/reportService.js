// services/reportService.js
const pool = require('../db');

class ReportService {
// In your backend service
// In services/reportService.js
static async getCustomerTrackingData(date) {
  try {
    // If date is a string, parse it
    let inputDateString;
    if (typeof date === 'string') {
      // Directly use the input date string
      inputDateString = date;
    } else {
      // Convert date object to YYYY-MM-DD format
      inputDateString = date.toISOString().split('T')[0];
    }

    console.log('Received Date String:', inputDateString);

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
        DATE(ci.check_in_time AT TIME ZONE 'Asia/Manila') = $1
      
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
        AND DATE(p.payment_date AT TIME ZONE 'Asia/Manila') = $1
      ORDER BY 
        timestamp;
    `;

    const result = await pool.query(trackingQuery, [inputDateString]);

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

    console.log('Processed data:', processedData);

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

    console.log('Income Summary Data Parameters:', {
        year,
        yearFilter,
        period,
        date,
        dateType: typeof date
    });

    let paymentQuery;
    let queryParams;

    if (period === 'monthly') {
        // Monthly query remains EXACTLY the same
        paymentQuery = `
            SELECT 
                EXTRACT(MONTH FROM payment_date AT TIME ZONE 'Asia/Manila') AS period,
                SUM(CASE WHEN c.membership_type = 'Walk In' THEN amount ELSE 0 END) AS walk_in_income,
                SUM(CASE WHEN c.membership_type = 'Member' THEN amount ELSE 0 END) AS member_income
            FROM 
                Payment p
            JOIN 
                Customer c ON p.customer_id = c.customer_id
            WHERE 
                EXTRACT(YEAR FROM payment_date AT TIME ZONE 'Asia/Manila') = $1
            GROUP BY 
                period
            ORDER BY 
                period
        `;
        queryParams = [yearFilter];
    } else {
        // Daily income with explicit timezone handling
        console.log('Daily Income - Raw Date Input:', date);

        // Create a date in Manila timezone
        let targetDate;
        if (date) {
            // Parse the input date 
            targetDate = new Date(date);
        } else {
            // Use current date in Manila timezone
            targetDate = new Date();
        }

        // Convert to Manila timezone
        const manilaDateString = targetDate.toLocaleString('en-US', { 
            timeZone: 'Asia/Manila', 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit' 
        }).split(',')[0].replace(/\//g, '-');

        console.log('Processed Date Details:', {
            originalInput: date,
            inputDate: targetDate,
            manilaDateString: manilaDateString
        });

        paymentQuery = `
            SELECT 
                DATE(payment_date AT TIME ZONE 'Asia/Manila') AS period,
                SUM(CASE WHEN c.membership_type = 'Walk In' THEN amount ELSE 0 END) AS walk_in_income,
                SUM(CASE WHEN c.membership_type = 'Member' THEN amount ELSE 0 END) AS member_income
            FROM 
                Payment p
            JOIN 
                Customer c ON p.customer_id = c.customer_id
            WHERE 
                DATE(payment_date AT TIME ZONE 'Asia/Manila') = $1
            GROUP BY 
                period
        `;
        
        // Use the Manila timezone formatted date
        queryParams = [manilaDateString];
    }

    try {
        console.log('Executing Query:', {
            query: paymentQuery,
            params: queryParams
        });

        const result = await pool.query(paymentQuery, queryParams);

        console.log('Query Result:', {
            rowCount: result.rows.length,
            rows: result.rows
        });

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
            console.log('Processing Row:', row);

            const period = row.period;
            const walkInIncome = parseFloat(row.walk_in_income || 0);
            const memberIncome = parseFloat(row.member_income || 0);

            // For daily, use the date as the key
            walkInIncomeByPeriod[period] = walkInIncome;
            memberIncomeByPeriod[period] = memberIncome;
            
            totalWalkInIncome += walkInIncome;
            totalMemberIncome += memberIncome;
        });

        const resultData = {
            walkInIncomeByPeriod,
            memberIncomeByPeriod,
            totalWalkInIncome,
            totalMemberIncome,
            totalIncome: totalWalkInIncome + totalMemberIncome
        };

        console.log('Final Result Data:', resultData);

        return resultData;
    } catch (error) {
        console.error('Error in getIncomeSummaryData:', {
            message: error.message,
            stack: error.stack,
            originalError: error
        });
        throw error;
    }
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

    // If the year is in the future, return an empty result
    if (parsedYear > currentYear) {
      return { 
        success: true, 
        data: [],
        metadata: { 
          year: parsedYear, 
          period: period, 
          total_entries: 0
        } 
      };
    }

    if (isNaN(parsedYear) || parsedYear < 2000 || parsedYear > currentYear + 1) {
      throw new Error(`Please provide a valid year between 2000 and ${currentYear + 1}`);
    }

    const query = ` 
      WITH MemberPayments AS (
        SELECT 
          c.customer_id,
          c.name, 
          COUNT(p.payment_id) AS total_entries, 
          MAX(p.payment_date) AS last_payment_date 
        FROM 
          Customer c 
        JOIN 
          Membership m ON c.customer_id = m.customer_id 
        LEFT JOIN 
          Payment p ON c.customer_id = p.customer_id 
          AND EXTRACT(YEAR FROM p.payment_date) = $1
        WHERE 
          c.membership_type = 'Member' 
          AND m.status = 'Active'  
        GROUP BY 
          c.customer_id,
          c.name
      )
      SELECT 
        name, 
        total_entries, 
        last_payment_date 
      FROM 
        MemberPayments
      ORDER BY 
        total_entries DESC;
    `; 

    console.log('Executing query with year:', parsedYear);
    console.log('Full query:', query);

    const result = await pool.query(query, [parsedYear]);

    console.log('Query result rows:', result.rows);
    console.log('Query result row count:', result.rowCount);

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
    console.error('Detailed error in getMemberCustomerRecords:', {
      message: err.message,
      stack: err.stack,
      name: err.name,
      code: err.code,
      detail: err.detail,
      hint: err.hint
    });
    
    // Log the specific error details
    if (err.message.includes('syntax error')) {
      console.error('SQL Syntax Error Details:', {
        query: err.query,
        parameters: err.parameters
      });
    }

    throw err;
  }
}
// In reportService.js or server.js
static async getTransactionLogs() {
  try {
    const query = `
      SELECT 
        c.name,
        p.transaction_type,
        p.method AS payment_method,
        p.payment_date AS transaction_date,
        p.amount
      FROM 
        Payment p
      JOIN 
        Customer c ON p.customer_id = c.customer_id
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
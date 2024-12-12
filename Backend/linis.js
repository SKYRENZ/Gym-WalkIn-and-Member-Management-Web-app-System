const { Pool } = require('pg');

// Ensure all connection parameters are correctly specified
const pool = new Pool({
    user: 'postgres',         // Your PostgreSQL username
    host: 'localhost',        // Database host (usually localhost)
    database: 'GymDB',         // Your database name
    password: 'CHOCOLATES',   // Your PostgreSQL password (ensure it's a string)
    port: 5432,               // Default PostgreSQL port
});

async function updatePaymentAmounts() {
    const client = await pool.connect();

    try {
        // Start a transaction
        await client.query('BEGIN');

        // Log original amounts before update
        await client.query(`
            CREATE TABLE IF NOT EXISTS payment_amount_update_log (
                log_id SERIAL PRIMARY KEY,
                old_amount DECIMAL(10, 2),
                new_amount DECIMAL(10, 2),
                update_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Insert log of original amounts
        await client.query(`
            INSERT INTO payment_amount_update_log (old_amount, new_amount)
            SELECT DISTINCT amount, 
                   CASE 
                       WHEN c.membership_type = 'Walk In' THEN 60.00
                       ELSE 700.00
                   END
            FROM Payment p
            LEFT JOIN Customer c ON p.customer_id = c.customer_id
            WHERE amount NOT IN (60.00, 700.00)
        `);

        // Update walk-in payments
        const walkInUpdate = await client.query(`
            UPDATE Payment p
            SET amount = 60.00
            FROM Customer c
            WHERE p.customer_id = c.customer_id AND c.membership_type = 'Walk In'
            RETURNING *
        `);
        console.log('Walk-in payments updated:', walkInUpdate.rowCount);

        // Update membership payments
        const membershipUpdate = await client.query(`
            UPDATE Payment p
            SET amount = 700.00
            FROM Membership m
            WHERE p.membership_id = m.membership_id AND p.amount NOT IN (60.00, 700.00)
            RETURNING *
        `);
        console.log('Membership payments updated:', membershipUpdate.rowCount);

        // Commit the transaction
        await client.query('COMMIT');

        console.log('Payment amounts updated successfully');
    } catch (error) {
        // Rollback the transaction in case of error
        await client.query('ROLLBACK');
        console.error('Error updating payment amounts:', error);
    } finally {
        client.release();
    }
}

// Run the update
updatePaymentAmounts().catch(console.error);

// Ensure the process exits
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
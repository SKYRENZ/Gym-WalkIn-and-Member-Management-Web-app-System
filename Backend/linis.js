const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'GymDB',
    password: 'CHOCOLATES',
    port: 5432,
});

async function updatePaymentAmounts() {
    const client = await pool.connect();

    try {
        // Start a transaction
        await client.query('BEGIN');

        // Detailed investigation of payment amounts
        const problematicPayments = await client.query(`
            SELECT 
                p.payment_id, 
                p.amount, 
                p.payment_date, 
                p.method,
                p.status,
                c.name AS customer_name, 
                c.membership_type
            FROM Payment p
            JOIN Customer c ON p.customer_id = c.customer_id
            WHERE p.amount NOT IN (60.00, 700.00)
        `);

        console.log('Problematic Payments Before Update:');
        console.log(problematicPayments.rows);

        // Update walk-in payments
        const walkInUpdate = await client.query(`
            UPDATE Payment p
            SET amount = 60.00
            FROM Customer c
            WHERE p.customer_id = c.customer_id 
            AND c.membership_type = 'Walk In'
            AND p.amount != 60.00
            RETURNING *
        `);
        console.log('Walk-in payments updated:', walkInUpdate.rowCount);

        // Update member payments
        const memberUpdate = await client.query(`
            UPDATE Payment p
            SET amount = 700.00
            FROM Customer c
            WHERE p.customer_id = c.customer_id 
            AND c.membership_type = 'Member'
            AND p.amount NOT IN (60.00, 700.00)
            RETURNING *
        `);
        console.log('Member payments updated:', memberUpdate.rowCount);

        // Final verification of payment amounts
        const finalAmountDistribution = await client.query(`
            SELECT 
                c.membership_type,
                p.amount, 
                COUNT(*) as count,
                MIN(p.payment_date) as earliest_payment,
                MAX(p.payment_date) as latest_payment,
                STRING_AGG(DISTINCT p.method, ', ') as payment_methods
            FROM Payment p
            JOIN Customer c ON p.customer_id = c.customer_id
            GROUP BY c.membership_type, p.amount
            ORDER BY count DESC
        `);

        console.log('\nFinal Payment Amount Distribution:');
        console.log(finalAmountDistribution.rows);

        // Optional: Create a CSV log of updated payments
        if (walkInUpdate.rowCount > 0 || memberUpdate.rowCount > 0) {
            const updatedPaymentsLog = [...walkInUpdate.rows, ...memberUpdate.rows];
            console.log('\nDetailed Updated Payments:');
            console.table(updatedPaymentsLog.map(payment => ({
                payment_id: payment.payment_id,
                customer_id: payment.customer_id,
                old_amount: payment.amount,
                new_amount: payment.amount === 60.00 ? 60.00 : 700.00
            })));
        }

        // Commit the transaction
        await client.query('COMMIT');

        console.log('Payment amounts updated successfully');
    } catch (error) {
        // Rollback the transaction in case of error
        await client.query('ROLLBACK');
        console.error('Error updating payment amounts:', error);
        console.error('Error details:', error.message);
    } finally {
        client.release();
    }
}

// Run the update
updatePaymentAmounts().catch(console.error);

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Received SIGINT. Closing database connection.');
    await pool.end();
    process.exit(0);
});
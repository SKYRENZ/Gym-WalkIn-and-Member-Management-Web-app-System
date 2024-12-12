const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'GymDB',
    password: 'CHOCOLATES',
    port: 5432,
});

async function updateMembershipTypes() {
    const client = await pool.connect();

    try {
        // Start a transaction
        await client.query('BEGIN');

        // Check current membership type distribution
        const initialDistribution = await client.query(`
            SELECT 
                membership_type, 
                COUNT(*) as count
            FROM Customer
            GROUP BY membership_type
            ORDER BY count DESC
        `);

        console.log('Initial Membership Type Distribution:');
        console.log(initialDistribution.rows);

        // Identify customers with membership but no/incorrect membership type
        const membersToUpdate = await client.query(`
            SELECT 
                c.customer_id, 
                c.name, 
                c.membership_type AS old_type,
                COUNT(m.membership_id) AS membership_count
            FROM Customer c
            JOIN Membership m ON c.customer_id = m.customer_id
            WHERE c.membership_type IS NULL 
               OR c.membership_type NOT IN ('Member', 'Walk In')
            GROUP BY c.customer_id, c.name, c.membership_type
            LIMIT 50
        `);

        console.log('\nCustomers to be Updated:');
        console.log(membersToUpdate.rows);

        // Update membership type
        const updateResult = await client.query(`
            UPDATE Customer c
            SET membership_type = 'Member'
            FROM Membership m
            WHERE c.customer_id = m.customer_id 
            AND (c.membership_type IS NULL OR c.membership_type NOT IN ('Member', 'Walk In'))
            RETURNING *
        `);

        console.log('\nUpdate Results:');
        console.log(`Rows Updated: ${updateResult.rowCount}`);

        // Check final distribution
        const finalDistribution = await client.query(`
            SELECT 
                membership_type, 
                COUNT(*) as count
            FROM Customer
            GROUP BY membership_type
            ORDER BY count DESC
        `);

        console.log('\nFinal Membership Type Distribution:');
        console.log(finalDistribution.rows);

        // Commit the transaction
        await client.query('COMMIT');

        console.log('Membership type update process completed.');
    } catch (error) {
        // Rollback the transaction in case of error
        await client.query('ROLLBACK');
        console.error('Error updating membership types:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

// Run the update
updateMembershipTypes().catch(console.error);
// membershipService.js
const pool = require('./db'); // Adjust the path if necessary

async function updateMembershipStatus() {
    const currentDate = new Date();
    const updateStatusQuery = `
        UPDATE Membership
        SET status = 'Expired'
        WHERE end_date < $1 AND status = 'Active';
    `;

    try {
        const client = await pool.connect();
        await client.query(updateStatusQuery, [currentDate]);
    } catch (error) {
        console.error('Error updating membership status:', error);
    } finally {
        if (client) {
            client.release();
        }
    }
}

module.exports = { updateMembershipStatus };
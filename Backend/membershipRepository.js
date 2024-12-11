// membershipRepository.js
const pool = require('./db');

class MembershipRepository {
    async updateMembershipStatus(currentDate) {
        const updateStatusQuery = `
            UPDATE Membership
            SET status = 'Expired'
            WHERE end_date < $1 AND status = 'Active';
        `;
        const client = await pool.connect();
        try {
            await client.query(updateStatusQuery, [currentDate]);
        } catch (error) {
            console.error('Error updating membership status:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    async checkMembership(membershipId) {
        const checkMembershipQuery = `
            SELECT m.status, c.customer_id
            FROM Membership m
            JOIN Customer c ON m.customer_id = c.customer_id
            WHERE m.membership_id = $1;
        `;
        const client = await pool.connect();
        try {
            const result = await client.query(checkMembershipQuery, [membershipId]);
            return result.rows[0];
        } catch (error) {
            console.error('Error checking membership:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    async updateQRCodePath(membershipId, qrCodePath) {
        const updateQRCodeQuery = `
            UPDATE Membership
            SET qr_code_path = $1
            WHERE membership_id = $2;
        `;
        const client = await pool.connect();
        try {
            await client.query(updateQRCodeQuery, [qrCodePath, membershipId]);
        } catch (error) {
            console.error('Error updating QR code path:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    // Add other membership-related database methods as needed
}

module.exports = new MembershipRepository();
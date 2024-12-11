// membershipService.js
const pool = require('./db'); // Adjust the path if necessary
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

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
// Ensure the qrcodes directory exists
const qrcodesDir = path.join(__dirname, 'qrcodes');
if (!fs.existsSync(qrcodesDir)) {
    fs.mkdirSync(qrcodesDir); // Create the directory if it doesn't exist
}

async function generateQRCode(membershipId) {
    const qrCodePath = path.join(qrcodesDir, `${membershipId}.png`); // Path to save QR code
    try {
        // Generate QR code
        await QRCode.toFile(qrCodePath, membershipId.toString());
        console.log(`QR code generated for membership ID ${membershipId}: ${qrCodePath}`);
        return qrCodePath; // Return the path to the QR code
       } catch (error) {
        console.error('Error generating QR code:', error);
        throw error; // Rethrow the error for handling
      }
}

module.exports = { generateQRCode };

async function checkInMember(membershipId) {
    const checkMembershipQuery = `
        SELECT m.status, c.customer_id
        FROM Membership m
        JOIN Customer c ON m.customer_id = c.customer_id
        WHERE m.membership_id = $1;  -- Use membership_id for checking status
    `;

    const checkInQuery = `
        INSERT INTO CheckIn (membership_id, customer_id, check_in_time)  -- Include customer_id
        VALUES ($1, $2, $3);
    `;

    try {
        const client = await pool.connect();
        const checkInTime = new Date();

        // Check if the member has an active membership and get customer_id
        const membershipResult = await client.query(checkMembershipQuery, [membershipId]);
        if (membershipResult.rows.length === 0 || membershipResult.rows[0].status !== 'Active') {
            throw new Error('Member does not have an active membership.');
        }

        const customerId = membershipResult.rows[0].customer_id; // Get the customer_id

        // Proceed with check-in
        await client.query(checkInQuery, [membershipId, customerId, checkInTime]);
        console.log(`Member with Membership ID ${membershipId} checked in at ${checkInTime}`);
    } catch (error) {
        console.error('Error checking in member:', error);
        throw error; // Rethrow the error for handling in the endpoint
    } finally {
        if (client) {
            client.release();
        }
    }
}
module.exports = { updateMembershipStatus, checkInMember };

async function generateQRCodesForExistingMembers() {
    const membersWithoutQRCodeQuery = `
        SELECT m.membership_id
        FROM Membership m
        WHERE m.qr_code_path IS NULL;  -- Select members without QR codes
    `;

    let client; // Declare client variable here

    try {
        client = await pool.connect(); // Get a client from the pool
        const result = await client.query(membersWithoutQRCodeQuery);

        console.log('Members without QR codes:', result.rows); // Log the members found

        if (result.rows.length === 0) {
            console.log('No members found without QR codes.');
            return; // Exit if no members found
        }

        for (const row of result.rows) {
            const membershipId = row.membership_id;
            console.log(`Generating QR code for membership ID: ${membershipId}`); // Log the membership ID being processed
            const qrCodePath = await generateQRCode(membershipId); // Generate QR code

            // Update the Membership table with the QR code path
            const updateQRCodeQuery = `
                UPDATE Membership
                SET qr_code_path = $1
                WHERE membership_id = $2;
            `;
            await client.query(updateQRCodeQuery, [qrCodePath, membershipId]);
            console.log(`QR code generated and path updated for membership ID ${membershipId}: ${qrCodePath}`);
        }
    } catch (error) {
        console.error('Error generating QR codes for existing members:', error.message); // Log the specific error
        throw error; // Rethrow the error for handling in the endpoint
    } finally {
        if (client) {
            client.release(); // Ensure the client is released back to the pool
        }
    }
}
module.exports = { 
    updateMembershipStatus, 
    checkInMember, 
    generateQRCode, 
    generateQRCodesForExistingMembers 
};
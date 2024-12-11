const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');
const membershipRepository = require('./membershipRepository'); // Import the membership repository

const qrcodesDir = path.join(__dirname, 'qrcodes');
if (!fs.existsSync(qrcodesDir)) {
    fs.mkdirSync(qrcodesDir); // Create the directory if it doesn't exist
}

class QRCodeService {
    async generateQRCode(membershipId) {
        const qrCodePath = path.join(qrcodesDir, `${membershipId}.png`);
        try {
            await QRCode.toFile(qrCodePath, membershipId.toString());
            console.log(`QR code generated for membership ID ${membershipId}: ${qrCodePath}`);
            return qrCodePath;
        } catch (error) {
            console.error('Error generating QR code:', error);
            throw error;
        }
    }

    async generateQRCodesForExistingMembers() {
        const members = await membershipRepository.getAllActiveMembers(); // Example method
        for (const member of members) {
            await this.generateQRCode(member.membership_id);
        }
    }

    async updateQRCodePath(membershipId, qrCodePath) {
        await membershipRepository.updateQRCodePath(membershipId, qrCodePath);
    }
}

module.exports = new QRCodeService();
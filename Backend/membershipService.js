const membershipRepository = require('./membershipRepository');
const qrCodeService = require('./qrCodeService');

class MembershipService {
    async checkInMember(membershipId) {
        const membership = await membershipRepository.checkMembership(membershipId);
        if (!membership || membership.status !== 'Active') {
            throw new Error('Member does not have an active membership.');
        }
        // Proceed with check-in logic...
    }

    async generateQRCode(membershipId) {
        try {
            const qrCodePath = await qrCodeService.generateQRCode(membershipId);
            await this.updateQRCodePath(membershipId, qrCodePath); // Call the service method
            return qrCodePath;
        } catch (error) {
            console.error('Error generating QR code:', error);
            throw new Error('Failed to generate QR code.');
        }
    }

    async updateQRCodePath(membershipId, qrCodePath) {
        try {
            await membershipRepository.updateQRCodePath(membershipId, qrCodePath);
        } catch (error) {
            console.error('Error updating QR code path in the database:', error);
            throw new Error('Failed to update QR code path in the database.');
        }
    }

    // Other membership-related methods...
}

module.exports = new MembershipService();
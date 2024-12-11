// controllers/membershipController.js
const membershipService = require('../membershipService');

class MembershipController {
    async updateMembershipStatus(req, res) {
        try {
            await membershipService.updateMembershipStatus();
            res.status(200).json({ message: 'Membership statuses updated successfully.' });
        } catch (error) {
            console.error('Error updating membership status:', error);
            res.status(500).json({ error: 'An error occurred while updating membership statuses.' });
        }
    }

    async checkInMember(req, res) {
        const { membershipId } = req.body;
        try {
            await membershipService.checkInMember(membershipId);
            res.status(200).json({ message: `Member with Membership ID ${membershipId} checked in successfully.` });
        } catch (error) {
            console.error('Error checking in member:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async generateQRCode(req, res) {
        const { membershipId } = req.body;
        try {
            const qrCodePath = await membershipService.generateQRCode(membershipId);
            res.status(200).json({ message: 'QR code generated successfully.', qrCodePath });
        } catch (error) {
            console.error('Error generating QR code:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async generateQRCodesForExistingMembers(req, res) {
        try {
            await membershipService.generateQRCodesForExistingMembers();
            res.status(200).json({ message: 'QR codes generated for existing members successfully.' });
        } catch (error) {
            console.error('Error generating QR codes for existing members:', error);
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new MembershipController();
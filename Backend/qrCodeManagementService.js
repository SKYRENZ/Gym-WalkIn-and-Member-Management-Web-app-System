const qrCodeService = require('./qrCodeService');

class QRCodeManagementService {
    async generateQRCodesForExistingMembers() {
        await qrCodeService.generateQRCodesForExistingMembers();
    }
}

module.exports = new QRCodeManagementService();
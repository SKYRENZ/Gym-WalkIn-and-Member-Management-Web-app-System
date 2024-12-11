// routes.js
const express = require('express');
const membershipController = require('../controllers/membershipController'); // Adjust the path if necessary

const router = express.Router();

// Define your routes and link them to the controller methods
router.post('/updateMembershipStatus', membershipController.updateMembershipStatus);
router.post('/checkIn', membershipController.checkInMember);
router.post('/generateQRCode', membershipController.generateQRCode);
router.post('/generateQRCodesForExistingMembers', membershipController.generateQRCodesForExistingMembers);

// Export the router
module.exports = router;
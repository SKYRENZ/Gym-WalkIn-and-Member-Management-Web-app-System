// routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const ReportService = require('../services/reportService');

// In reportRoutes.js or server.js
router.get('/customerTracking', async (req, res) => {
  const dateParam = req.query.date || new Date().toISOString().split('T')[0];
  
  try {
    const trackingData = await ReportService.getCustomerTrackingData(dateParam);
    res.status(200).json({
      success: true,
      data: trackingData
    });
  } catch (error) {
    console.error('Error in customerTracking route:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error fetching customer tracking data', 
      details: error.message 
    });
  }
});

// Member Counting Route
router.get('/memberCounting', async (req, res) => {
  const { year = new Date().getFullYear(), period = 'monthly' } = req.query;
  
  try {
    const memberData = await ReportService.getMemberCountData(year, period);
    res.status(200).json({
      success: true,
      data: memberData
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Error fetching member counting data', 
      details: error.message 
    });
  }
});

// Income Summary Route
router.get('/incomeSummary', async (req, res) => {
  const { 
    year = new Date().getFullYear(), 
    period = 'monthly', 
    type = 'Walk In' 
  } = req.query;
  
  try {
    const incomeData = await ReportService.getIncomeSummaryData(year, period, type);
    res.status(200).json({
      success: true,
      data: incomeData
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Error fetching income summary data', 
      details: error.message 
    });
  }
});
router.get('/active-members', async (req, res) => {
  try {
      // Fetch customers with role 'Member' and status 'Active'
      const activeMembers = await Customer.findAll({
          where: {
              role: 'Member', // Assuming 'role' is the field for user role
              status: 'Active' // Assuming 'status' is the field for user status
          }
      });

      // Return the list of active members
      res.json(activeMembers);
  } catch (error) {
      console.error('Error fetching active members:', error);
      res.status(500).json({ error: 'Failed to fetch active members' });
  }
});
module.exports = router;
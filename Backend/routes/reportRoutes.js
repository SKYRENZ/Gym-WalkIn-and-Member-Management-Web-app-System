// routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const ReportService = require('../services/reportService');

// Customer Tracking Route
router.get('/customerTracking', async (req, res) => {
  const dateParam = req.query.date || new Date().toISOString().split('T')[0];
  
  try {
    const trackingData = await ReportService.getCustomerTrackingData(dateParam);
    res.status(200).json(trackingData);
  } catch (error) {
    res.status(500).json({ 
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

module.exports = router;
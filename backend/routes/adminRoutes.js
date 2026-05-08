const express = require('express');
const router = express.Router();
const { getDashboardStats, getRevenueAnalytics, getOperationalOverview, getStaffStats } = require('../controllers/adminController');
const { auth, adminOnly } = require('../middleware/auth');

// Apply auth and adminOnly to all routes
router.use(auth);
router.use(adminOnly);

router.get('/stats', getDashboardStats);
router.get('/analytics', getRevenueAnalytics);
router.get('/operations', getOperationalOverview);
router.get('/staff', getStaffStats);

module.exports = router;

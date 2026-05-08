const express = require('express');
const router = express.Router();
const { getTrains, searchTrains, getTrainById, createTrain, updateTrainStatus, saveTrain, getSavedTrains, getTrainLocation, deleteTrain } = require('../controllers/trainController');
const { auth, adminOnly } = require('../middleware/auth');

// Public routes
router.get('/', getTrains);
router.get('/search', searchTrains);
router.get('/:id', getTrainById);
router.get('/:id/location', getTrainLocation);

// Protected routes
router.post('/:id/save', auth, saveTrain);
router.get('/user/saved', auth, getSavedTrains);

// Admin routes
router.post('/', auth, adminOnly, createTrain);
router.put('/:id/status', auth, adminOnly, updateTrainStatus);
router.delete('/:id', auth, adminOnly, deleteTrain);

module.exports = router;

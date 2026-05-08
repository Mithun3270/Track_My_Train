const express = require('express');
const seatController = require('../controllers/seatController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Public routes - view seats
router.get('/:trainId/all', seatController.getAllSeatsForTrain);
router.get('/:trainId/available', seatController.getAvailableSeats);
router.get('/:trainId/stats', seatController.getSeatStats);

// Protected routes - book seats (require authentication)
router.post('/:seatId/book', auth, seatController.bookSeat);
router.post('/:seatId/hold', auth, seatController.holdSeat);
router.delete('/:seatId/cancel', auth, seatController.cancelBooking);

module.exports = router;

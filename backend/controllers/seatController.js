const mongoose = require('mongoose');
const Seat = require('../models/Seat');
const Train = require('../models/Train');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Generate seats for a new train (auto-called on train creation)
exports.generateSeatsForTrain = async (trainId) => {
	try {
		const train = await Train.findById(trainId);
		if (!train) throw new Error('Train not found');

		const seats = [];
		const fareMap = {
			'General': train.fare.general || 200,
			'AC': train.fare.ac || 400,
			'Sleeper': train.fare.sleeper || 300
		};

		// Generate 12 coaches, 66 seats per coach (11 rows × 6 columns)
		for (let coach = 1; coach <= 12; coach++) {
			const seatClass = coach <= 4 ? 'General' : coach <= 8 ? 'AC' : 'Sleeper';
			const fare = fareMap[seatClass];
			const coachStr = String(coach); // Store as String to match Seat schema

			for (let row = 1; row <= 11; row++) {
				for (let col = 0; col < 6; col++) {
					const colLetter = String.fromCharCode(65 + col); // A-F
					seats.push({
						trainId,
						seatNumber: `${coach}-${colLetter}${row}`,
						coach: coachStr,
						seatClass,
						status: 'Available',
						fare,
						seatRow: row,
						seatColumn: colLetter
					});
				}
			}
		}

		await Seat.insertMany(seats);
		console.log(`✅ Generated ${seats.length} seats for train ${trainId}`);
	} catch (err) {
		console.error('❌ Error generating seats:', err.message);
	}
};

// Get available seats for a train
exports.getAvailableSeats = async (req, res) => {
	try {
		const { trainId } = req.params;
		const { seatClass } = req.query;

		let query = { trainId, status: 'Available' };
		if (seatClass) query.seatClass = seatClass;

		const seats = await Seat.find(query).sort({ coach: 1, seatRow: 1, seatColumn: 1 });
		res.json({
			totalAvailable: seats.length,
			seats
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Server error' });
	}
};

// Get all seats for a train (with status - for UI display)
exports.getAllSeatsForTrain = async (req, res) => {
	try {
		const { trainId } = req.params;

		let seats = await Seat.find({ trainId }).sort({ coach: 1, seatRow: 1, seatColumn: 1 });

		// Auto-generate seats if none exist for this train
		if (seats.length === 0) {
			console.log(`🪑 No seats found for train ${trainId}, auto-generating...`);
			await exports.generateSeatsForTrain(trainId);
			seats = await Seat.find({ trainId }).sort({ coach: 1, seatRow: 1, seatColumn: 1 });
		}
		
		// Group by coach for easier UI rendering
		const coachesByNumber = {};
		seats.forEach(seat => {
			if (!coachesByNumber[seat.coach]) {
				coachesByNumber[seat.coach] = [];
			}
			coachesByNumber[seat.coach].push(seat);
		});

		res.json({
			totalSeats: seats.length,
			coaches: coachesByNumber,
			summary: {
				available: seats.filter(s => s.status === 'Available').length,
				booked: seats.filter(s => s.status === 'Booked').length,
				onHold: seats.filter(s => s.status === 'Hold').length
			}
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Server error' });
	}
};

// Book a seat
exports.bookSeat = async (req, res) => {
	try {
		const { seatId } = req.params;
		const userId = req.userId; // From auth middleware

		const seat = await Seat.findById(seatId);
		if (!seat) {
			return res.status(404).json({ error: 'Seat not found' });
		}

		if (seat.status !== 'Available') {
			return res.status(400).json({ error: `Seat is ${seat.status}` });
		}

		// Update seat
		seat.status = 'Booked';
		seat.bookedBy = userId;
		seat.bookedDate = new Date();
		await seat.save();

		const onboardFood = req.body.onboardFood || 'None';
		const bookingRef = req.body.bookingRef || '';
		let foodFare = 0;
		if (onboardFood === 'Veg') foodFare = 150;
		if (onboardFood === 'Non-Veg') foodFare = 200;

		// Add to user's booked seats
		const user = await User.findById(userId);
		if (!user.bookedSeats) user.bookedSeats = [];
		user.bookedSeats.push({
			seatId,
			trainId: seat.trainId,
			seatNumber: seat.seatNumber,
			fare: seat.fare,
			foodFare: foodFare,
			onboardFood: onboardFood,
			bookingRef: bookingRef,
			bookedDate: new Date()
		});
		await user.save();

		const train = await Train.findById(seat.trainId);
		if (train) {
			await Notification.create({
				userId,
				trainId: seat.trainId,
				type: 'info',
				title: 'Ticket Confirmed! 🎟️',
				message: `Your seat ${seat.seatNumber} on ${train.trainName} has been booked.`,
				priority: 'high'
			});
		}

		res.json({
			message: 'Seat booked successfully',
			seat,
			fare: seat.fare
		});
	} catch (err) {
		console.error(err);
		res.status(400).json({ error: err.message });
	}
};

// Hold seat (30 min timeout for payment)
exports.holdSeat = async (req, res) => {
	try {
		const { seatId } = req.params;

		const seat = await Seat.findById(seatId);
		if (!seat) {
			return res.status(404).json({ error: 'Seat not found' });
		}

		if (seat.status !== 'Available') {
			return res.status(400).json({ error: `Seat is ${seat.status}` });
		}

		seat.status = 'Hold';
		await seat.save();

		// Auto-release after 30 minutes
		setTimeout(async () => {
			const updatedSeat = await Seat.findById(seatId);
			if (updatedSeat.status === 'Hold') {
				updatedSeat.status = 'Available';
				updatedSeat.bookedBy = null;
				await updatedSeat.save();
				console.log(`🔓 Seat ${seatId} released after hold timeout`);
			}
		}, 30 * 60 * 1000);

		res.json({
			message: 'Seat held for 30 minutes',
			seat,
			hoursUntilRelease: 0.5
		});
	} catch (err) {
		console.error(err);
		res.status(400).json({ error: err.message });
	}
};

// Cancel booking and release seat
exports.cancelBooking = async (req, res) => {
	try {
		const { seatId } = req.params;
		const userId = req.userId;

		const seat = await Seat.findById(seatId);
		if (!seat) {
			return res.status(404).json({ error: 'Seat not found' });
		}

		if (seat.bookedBy.toString() !== userId) {
			return res.status(403).json({ error: 'Unauthorized' });
		}

		seat.status = 'Available';
		seat.bookedBy = null;
		seat.bookedDate = null;
		await seat.save();

		// Mark as cancelled in user's bookings instead of removing it completely
		const user = await User.findById(userId);
		const userBooking = user.bookedSeats.find(s => s.seatId.toString() === seatId);
		if (userBooking) {
			userBooking.status = 'Cancelled';
		}
		await user.save();

		const train = await Train.findById(seat.trainId);
		if (train) {
			await Notification.create({
				userId,
				trainId: seat.trainId,
				type: 'alert',
				title: 'Ticket Cancelled ❌',
				message: `Booking for seat ${seat.seatNumber} on ${train.trainName} has been cancelled.`,
				priority: 'high'
			});
		}

		res.json({
			message: 'Booking cancelled and refund processed',
			seat
		});
	} catch (err) {
		console.error(err);
		res.status(400).json({ error: err.message });
	}
};

// Get seat statistics for a train
exports.getSeatStats = async (req, res) => {
	try {
		const { trainId } = req.params;

		const stats = await Seat.aggregate([
			{ $match: { trainId: new mongoose.Types.ObjectId(trainId) } },
			{
				$group: {
					_id: '$seatClass',
					total: { $sum: 1 },
					available: { $sum: { $cond: [{ $eq: ['$status', 'Available'] }, 1, 0] } },
					booked: { $sum: { $cond: [{ $eq: ['$status', 'Booked'] }, 1, 0] } },
					onHold: { $sum: { $cond: [{ $eq: ['$status', 'Hold'] }, 1, 0] } },
					avgFare: { $avg: '$fare' }
				}
			}
		]);

		res.json({ stats });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Server error' });
	}
};

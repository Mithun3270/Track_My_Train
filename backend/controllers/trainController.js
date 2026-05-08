const Train = require('../models/Train');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Get all trains
exports.getTrains = async (req, res) => {
	try {
		const trains = await Train.find({ isActive: true });
		res.json(trains);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Server error' });
	}
};

// Search trains by source and destination
exports.searchTrains = async (req, res) => {
	try {
		const { source, destination, date, trainType } = req.query;

		let query = {};
		if (source) query.source = { $regex: source, $options: 'i' };
		if (destination) query.destination = { $regex: destination, $options: 'i' };
		if (trainType) query.trainType = trainType;

		const trains = await Train.find(query);
		console.log(`🔍 Search query: source=${source}, destination=${destination}, found ${trains.length} trains`);
		res.json(trains);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Server error' });
	}
};

// Get train by ID with route details
exports.getTrainById = async (req, res) => {
	try {
		const train = await Train.findById(req.params.id);
		if (!train) {
			return res.status(404).json({ error: 'Train not found' });
		}
		res.json(train);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Server error' });
	}
};

// Create new train (admin only)
exports.createTrain = async (req, res) => {
	try {
		const trainData = req.body;
		const train = new Train(trainData);
		const saved = await train.save();

		// Generate seats for this train
		const seatController = require('./seatController');
		seatController.generateSeatsForTrain(saved._id);

		res.status(201).json({
			message: 'Train created successfully',
			train: saved
		});
	} catch (err) {
		console.error(err);
		res.status(400).json({ error: err.message });
	}
};

// Update train status and location (for live tracking)
exports.updateTrainStatus = async (req, res) => {
	try {
		const { id } = req.params;
		const { status, currentStation, currentLocation, delayMinutes } = req.body;

		const train = await Train.findById(id);
		if (!train) {
			return res.status(404).json({ error: 'Train not found' });
		}

		const previousStatus = train.status;
		const previousDelay = train.delayMinutes;
		const previousStation = train.currentStation;

		if (status) train.status = status;
		if (currentStation) train.currentStation = currentStation;
		if (currentLocation) train.currentLocation = { ...currentLocation, lastUpdated: new Date() };
		if (delayMinutes !== undefined) train.delayMinutes = delayMinutes;

		await train.save();

		// Trigger notifications if status changed
		if (status && status !== previousStatus) {
			await notifyUsersAboutTrain(id, train.trainNumber, `Train status: ${status}`);
		}

		// Notify if delay increased significantly
		if (delayMinutes && delayMinutes > previousDelay + 5) {
			await notifyUsersAboutTrain(id, train.trainNumber, `Delay updated: ${delayMinutes} minutes`);
		}

		// Food delivery notifications on station arrival
		if (currentStation && currentStation !== previousStation) {
			const FoodOrder = require('../models/FoodOrder');
			const orders = await FoodOrder.find({ 
				trainId: id, 
				station: { $regex: currentStation.split(' (')[0], $options: 'i' },
				status: { $in: ['Pending', 'Confirmed', 'Preparing'] }
			});

			for (let order of orders) {
				const notification = new Notification({
					userId: order.userId,
					trainId: id,
					type: 'info',
					title: '🍴 Food Arrival Alert!',
					message: `The train has arrived at ${currentStation}. Your food order ${order.orderId} will be delivered to your seat shortly!`,
					priority: 'high'
				});
				await notification.save();
				
				// Update order status
				order.status = 'Ready';
				await order.save();
			}
		}

		res.json({
			message: 'Train status updated successfully',
			train
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Server error' });
	}
};

// Save train to user's favorites
exports.saveTrain = async (req, res) => {
	try {
		const userId = req.userId;
		const trainId = req.params.id; // trainId comes from route param /:id/save

		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ error: 'User not found' });
		}

		if (!user.savedTrains.includes(trainId)) {
			user.savedTrains.push(trainId);
			await user.save();
		}

		res.json({ message: 'Train saved successfully', savedTrains: user.savedTrains });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Server error' });
	}
};

// Get user's saved trains
exports.getSavedTrains = async (req, res) => {
	try {
		const userId = req.userId;

		const user = await User.findById(userId).populate('savedTrains');
		if (!user) {
			return res.status(404).json({ error: 'User not found' });
		}

		res.json(user.savedTrains);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Server error' });
	}
};

// Get live location of train
exports.getTrainLocation = async (req, res) => {
	try {
		const { id } = req.params;

		const train = await Train.findById(id);
		if (!train) {
			return res.status(404).json({ error: 'Train not found' });
		}

		res.json({
			trainNumber: train.trainNumber,
			trainName: train.trainName,
			currentStation: train.currentStation,
			status: train.status,
			delayMinutes: train.delayMinutes,
			location: train.currentLocation,
			nextStation: train.route && train.route.length > 0 ? train.route[0] : null
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Server error' });
	}
};

// Delete train (admin only)
exports.deleteTrain = async (req, res) => {
	try {
		const train = await Train.findByIdAndDelete(req.params.id);
		if (!train) {
			return res.status(404).json({ error: 'Train not found' });
		}
		res.json({ message: 'Train deleted successfully' });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Server error' });
	}
};

// Helper function to notify users
async function notifyUsersAboutTrain(trainId, trainNumber, message) {
	try {
		const users = await User.find({ 'bookedSeats.trainId': trainId });

		for (let user of users) {
			const notification = new Notification({
				userId: user._id,
				trainId: trainId,
				type: 'alert',
				title: `Train ${trainNumber} Update`,
				message: message,
				priority: 'high'
			});
			await notification.save();
		}
	} catch (err) {
		console.error('Error sending notifications:', err);
	}
}

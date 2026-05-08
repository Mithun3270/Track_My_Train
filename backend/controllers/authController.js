const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (userId, role) => {
	return jwt.sign(
		{ userId, role },
		process.env.JWT_SECRET || 'your-secret-key',
		{ expiresIn: '7d' }
	);
};

exports.register = async (req, res) => {
	try {
		const { username, email, password, firstName, lastName, phoneNumber } = req.body;

		// Check if user exists
		let user = await User.findOne({ $or: [{ email }, { username }] });
		if (user) {
			return res.status(400).json({ error: 'User already exists' });
		}

		// Create new user
		user = new User({
			username,
			email,
			password,
			firstName,
			lastName,
			phoneNumber,
			role: 'user'
		});

		await user.save();

		const token = generateToken(user._id, user.role);

		res.status(201).json({
			message: 'User registered successfully',
			token,
			user: {
				id: user._id,
				username: user.username,
				email: user.email,
				firstName: user.firstName,
				lastName: user.lastName,
				role: user.role
			}
		});
	} catch (err) {
		console.error(err);
		// Handle MongoDB duplicate key error
		if (err.code === 11000) {
			const field = Object.keys(err.keyPattern || {})[0];
			if (field === 'email') return res.status(400).json({ error: 'An account with this email already exists. Please sign in instead.' });
			if (field === 'username') return res.status(400).json({ error: 'Username conflict. Please try again.' });
			return res.status(400).json({ error: 'Account already exists.' });
		}
		res.status(500).json({ error: 'Server error during registration' });
	}
};

exports.login = async (req, res) => {
	try {
		const { email, password } = req.body;

		// Validate input
		if (!email || !password) {
			return res.status(400).json({ error: 'Email and password required' });
		}

		// Find user
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(400).json({ error: 'Invalid credentials' });
		}

		// Check password
		const isMatch = await user.comparePassword(password);
		if (!isMatch) {
			return res.status(400).json({ error: 'Invalid credentials' });
		}

		// Update last login
		user.lastLogin = new Date();
		await user.save();

		const token = generateToken(user._id, user.role);

		res.json({
			message: 'Login successful',
			token,
			user: {
				id: user._id,
				username: user.username,
				email: user.email,
				firstName: user.firstName,
				lastName: user.lastName,
				phoneNumber: user.phoneNumber,
				role: user.role
			}
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Server error during login' });
	}
};

exports.getProfile = async (req, res) => {
	try {
		const user = await User.findById(req.userId).select('-password');
		if (!user) {
			return res.status(404).json({ error: 'User not found' });
		}
		res.json(user);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Server error' });
	}
};

exports.updateProfile = async (req, res) => {
	try {
		const { firstName, lastName, phoneNumber, preferences } = req.body;

		let user = await User.findById(req.userId);
		if (!user) {
			return res.status(404).json({ error: 'User not found' });
		}

		if (firstName) user.firstName = firstName;
		if (lastName) user.lastName = lastName;
		if (phoneNumber) user.phoneNumber = phoneNumber;
		if (preferences) user.preferences = { ...user.preferences, ...preferences };

		await user.save();

		res.json({
			message: 'Profile updated successfully',
			user: {
				id: user._id,
				username: user.username,
				email: user.email,
				firstName: user.firstName,
				lastName: user.lastName,
				phoneNumber: user.phoneNumber,
				preferences: user.preferences
			}
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Server error' });
	}
};

exports.getBookings = async (req, res) => {
	try {
		const user = await User.findById(req.userId).populate({
			path: 'bookedSeats.trainId',
			model: 'Train',
			select: 'trainNumber trainName source destination currentStation status delayMinutes currentLocation'
		});

		if (!user) {
			return res.status(404).json({ error: 'User not found' });
		}

		res.json(user.bookedSeats || []);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Server error retrieving bookings' });
	}
};

exports.deleteBooking = async (req, res) => {
	try {
		const { seatId } = req.params;
		const user = await User.findById(req.userId);
		if (!user) {
			return res.status(404).json({ error: 'User not found' });
		}
		user.bookedSeats = user.bookedSeats.filter(s => s.seatId.toString() !== seatId);
		await user.save();
		res.json({ message: 'Booking removed from history' });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Server error deleting booking' });
	}
};

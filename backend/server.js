const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
require('dotenv').config();

const connectDB = require('./config/db');
const trainRoutes = require('./routes/trainRoutes');
const authRoutes = require('./routes/authRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const seatRoutes = require('./routes/seatRoutes');
const foodRoutes = require('./routes/foodRoutes');
const adminRoutes = require('./routes/adminRoutes');


const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve frontend static files
const path = require('path');
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/trains', trainRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/seats', seatRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/admin', adminRoutes);


// Serve index.html for root route
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// 404 handler
app.use((req, res) => {
	res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(PORT, () => {
	console.log(`🚆 TrackMyTrain Server running on port ${PORT}`);
	console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
	console.log(`🌐 Open: http://localhost:${PORT}`);

	// Auto-open browser (only on first start, not nodemon restarts)
	if (!process.env.BROWSER_OPENED) {
		process.env.BROWSER_OPENED = 'true';
		const url = `http://localhost:${PORT}`;
		const start = process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open';
		exec(`${start} ${url}`);
	}
});

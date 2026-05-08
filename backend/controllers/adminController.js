const mongoose = require('mongoose');
const Train = require('../models/Train');
const Seat = require('../models/Seat');
const User = require('../models/User');
const FoodOrder = require('../models/FoodOrder');

exports.getDashboardStats = async (req, res) => {
    try {
        const totalTrains = await Train.countDocuments();
        const activeTrains = await Train.countDocuments({ status: 'Running' });
        const totalUsers = await User.countDocuments({ role: 'user' });
        
        // Sum all booked seats for ticket revenue
        // We use the bookedSeats array in User model or Seat model
        // Let's use Seat model for more direct aggregation
        const seatStats = await Seat.aggregate([
            { $match: { status: 'Booked' } },
            { $group: { _id: null, totalRevenue: { $sum: '$fare' }, totalBookings: { $sum: 1 } } }
        ]);

        const ticketRevenue = seatStats.length > 0 ? seatStats[0].totalRevenue : 0;
        const totalBookings = seatStats.length > 0 ? seatStats[0].totalBookings : 0;

        // Food revenue
        const foodStats = await FoodOrder.aggregate([
            { $match: { status: { $ne: 'Cancelled' } } },
            { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
        ]);

        const foodRevenue = foodStats.length > 0 ? foodStats[0].totalRevenue : 0;

        // Mock operational metrics
        const delayedTrains = await Train.countDocuments({ status: 'Delayed' });
        const maintenanceTrains = await Train.countDocuments({ status: 'Cancelled' }); // Assuming cancelled often means maintenance/yard

        res.json({
            stats: {
                totalTrains,
                activeTrains,
                delayedTrains,
                maintenanceTrains,
                totalUsers,
                totalBookings
            },
            revenue: {
                ticketRevenue,
                foodRevenue,
                totalRevenue: ticketRevenue + foodRevenue,
                currency: 'INR'
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch admin stats' });
    }
};

exports.getRevenueAnalytics = async (req, res) => {
    try {
        // Daily revenue for the last 7 days (mocking some trend data combined with real sums)
        const days = 7;
        const trend = [];
        const now = new Date();

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            
            const nextDay = new Date(date);
            nextDay.setDate(nextDay.getDate() + 1);

            const dayBookings = await Seat.aggregate([
                { $match: { status: 'Booked', bookedDate: { $gte: date, $lt: nextDay } } },
                { $group: { _id: null, amount: { $sum: '$fare' } } }
            ]);

            const dayFood = await FoodOrder.aggregate([
                { $match: { status: { $ne: 'Cancelled' }, createdAt: { $gte: date, $lt: nextDay } } },
                { $group: { _id: null, amount: { $sum: '$totalAmount' } } }
            ]);

            const revenue = (dayBookings[0]?.amount || 0) + (dayFood[0]?.amount || 0);
            
            // Add some base mock data if revenue is 0 to make the chart look "alive" for demo
            const finalRevenue = revenue || Math.floor(Math.random() * 5000) + 2000;
            const expense = Math.floor(finalRevenue * 0.4) + 1500; // Mock expense logic

            trend.push({
                date: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
                revenue: finalRevenue,
                expense: expense,
                profit: finalRevenue - expense
            });
        }

        // Booking class distribution
        const classDist = await Seat.aggregate([
            { $match: { status: 'Booked' } },
            { $group: { _id: '$seatClass', count: { $sum: 1 } } }
        ]);

        res.json({
            trend,
            distribution: classDist
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
};

exports.getOperationalOverview = async (req, res) => {
    try {
        const trains = await Train.find().sort({ status: 1 });
        
        // Enhance with occupancy percentage
        const enhancedTrains = await Promise.all(trains.map(async (t) => {
            const totalSeats = await Seat.countDocuments({ trainId: t._id });
            const bookedSeats = await Seat.countDocuments({ trainId: t._id, status: 'Booked' });
            const occupancy = totalSeats > 0 ? Math.round((bookedSeats / totalSeats) * 100) : 0;
            
            return {
                ...t.toObject(),
                occupancy
            };
        }));

        res.json(enhancedTrains);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch operations' });
    }
};

exports.getStaffStats = async (req, res) => {
    // Returning mock staff data for the dashboard
    res.json({
        totalStaff: 142,
        activeLocoPilots: 28,
        onDutyGuards: 24,
        attendanceRate: 94,
        nextShiftStaff: 12
    });
};

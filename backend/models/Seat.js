const mongoose = require('mongoose');

const SeatSchema = new mongoose.Schema({
	trainId: { type: mongoose.Schema.Types.ObjectId, ref: 'Train', required: true },
	seatNumber: { type: String, required: true }, // A1, A2, B1, etc
	coach: { type: String, required: true }, // Coach number (1-12)
	seatClass: { type: String, enum: ['General', 'AC', 'Sleeper'], default: 'General' },
	status: { type: String, enum: ['Available', 'Booked', 'Hold'], default: 'Available' },
	bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	bookedDate: { type: Date },
	fare: { type: Number, required: true },
	seatRow: { type: Number }, // Row number for UI grid (1-11)
	seatColumn: { type: String }, // Column letter (A-F)
}, { timestamps: true });

// Compound unique index for train + seat combo
SeatSchema.index({ trainId: 1, seatNumber: 1 }, { unique: true });

module.exports = mongoose.model('Seat', SeatSchema);

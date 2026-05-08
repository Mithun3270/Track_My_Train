const mongoose = require('mongoose');
const Train = require('./models/Train');
const Seat = require('./models/Seat');

const generateSeatsForAllTrains = async () => {
	try {
		const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/trackmytrain';
		
		await mongoose.connect(uri, {
			useNewUrlParser: true,
			useUnifiedTopology: true
		});

		console.log('✅ MongoDB connected');

		// Get all trains
		const trains = await Train.find({});
		console.log(`📍 Found ${trains.length} trains`);

		// Clear existing seats
		await Seat.deleteMany({});
		console.log('🗑️ Cleared existing seats');

		let totalSeatsCreated = 0;

		// Generate seats for each train
		for (const train of trains) {
			const seats = [];
			const fareMap = {
				'General': train.fare?.general || 200,
				'AC': train.fare?.ac || 400,
				'Sleeper': train.fare?.sleeper || 300
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
							trainId: train._id,
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

			const result = await Seat.insertMany(seats);
			totalSeatsCreated += result.length;
			console.log(`   ✅ ${result.length} seats generated for Train #${train.trainNumber}`);
		}

		console.log(`\n✅ Successfully generated ${totalSeatsCreated} seats for ${trains.length} trains!`);
		await mongoose.connection.close();
		process.exit(0);
	} catch (error) {
		console.error('❌ Error generating seats:', error);
		process.exit(1);
	}
};

generateSeatsForAllTrains();

const mongoose = require('mongoose');
const Train = require('./models/Train');
const User = require('./models/User');

// ─── NATIONAL STATE-TO-STATE TRAINS ────────────────────────────────────────────
const nationalTrains = [
  { trainNumber: "12951", trainName: "Mumbai Rajdhani Express",   source: "Mumbai (Maharashtra)",    destination: "New Delhi (Delhi)",         trainType: "Rajdhani", delayMinutes: 0,  fare: { general: 800, ac: 1800, sleeper: 1200 } },
  { trainNumber: "12952", trainName: "New Delhi Rajdhani",         source: "New Delhi (Delhi)",       destination: "Mumbai (Maharashtra)",      trainType: "Rajdhani", delayMinutes: 5,  fare: { general: 800, ac: 1800, sleeper: 1200 } },
  { trainNumber: "12301", trainName: "Howrah Rajdhani Express",    source: "Kolkata (West Bengal)",   destination: "New Delhi (Delhi)",         trainType: "Rajdhani", delayMinutes: 10, fare: { general: 750, ac: 1700, sleeper: 1100 } },
  { trainNumber: "12302", trainName: "New Delhi-Howrah Rajdhani",  source: "New Delhi (Delhi)",       destination: "Kolkata (West Bengal)",     trainType: "Rajdhani", delayMinutes: 0,  fare: { general: 750, ac: 1700, sleeper: 1100 } },
  { trainNumber: "22691", trainName: "KSR Bengaluru Rajdhani",     source: "Bangalore (Karnataka)",   destination: "New Delhi (Delhi)",         trainType: "Rajdhani", delayMinutes: 15, fare: { general: 900, ac: 2000, sleeper: 1400 } },
  { trainNumber: "12621", trainName: "Tamil Nadu Express",         source: "Chennai (Tamil Nadu)",    destination: "New Delhi (Delhi)",         trainType: "Superfast", delayMinutes: 0, fare: { general: 600, ac: 1500, sleeper: 1000 } },
  { trainNumber: "12622", trainName: "Tamil Nadu Express (Return)",source: "New Delhi (Delhi)",       destination: "Chennai (Tamil Nadu)",      trainType: "Superfast", delayMinutes: 8, fare: { general: 600, ac: 1500, sleeper: 1000 } },
  { trainNumber: "11013", trainName: "Mumbai-Chennai Express",     source: "Mumbai (Maharashtra)",    destination: "Chennai (Tamil Nadu)",      trainType: "Express",   delayMinutes: 0, fare: { general: 550, ac: 1300, sleeper: 850 } },
  { trainNumber: "11014", trainName: "Chennai-Mumbai Express",     source: "Chennai (Tamil Nadu)",    destination: "Mumbai (Maharashtra)",      trainType: "Express",   delayMinutes: 20,fare: { general: 550, ac: 1300, sleeper: 850 } },
  { trainNumber: "12625", trainName: "Kerala Express",             source: "Thiruvananthapuram (Kerala)", destination: "New Delhi (Delhi)",     trainType: "Express",   delayMinutes: 5, fare: { general: 700, ac: 1600, sleeper: 1050 } },
  { trainNumber: "12839", trainName: "Howrah-Chennai Mail",        source: "Kolkata (West Bengal)",   destination: "Chennai (Tamil Nadu)",      trainType: "Express",   delayMinutes: 0, fare: { general: 480, ac: 1200, sleeper: 800 } },
  { trainNumber: "12245", trainName: "Howrah-Yesvantpur Duronto",  source: "Kolkata (West Bengal)",   destination: "Bangalore (Karnataka)",     trainType: "Superfast", delayMinutes: 0, fare: { general: 700, ac: 1600, sleeper: 1100 } },
  { trainNumber: "12627", trainName: "Karnataka Express",          source: "Bangalore (Karnataka)",   destination: "New Delhi (Delhi)",         trainType: "Express",   delayMinutes: 12,fare: { general: 600, ac: 1400, sleeper: 950 } },
  { trainNumber: "16031", trainName: "Andhra Pradesh Express",     source: "Hyderabad (Telangana)",   destination: "New Delhi (Delhi)",         trainType: "Express",   delayMinutes: 0, fare: { general: 650, ac: 1500, sleeper: 1000 } },
  { trainNumber: "12431", trainName: "Rajdhani Express",           source: "Thiruvananthapuram (Kerala)", destination: "New Delhi (Delhi)",     trainType: "Rajdhani", delayMinutes: 0, fare: { general: 850, ac: 1900, sleeper: 1300 } },
  { trainNumber: "12403", trainName: "Allahabad Rajdhani",         source: "Allahabad (Uttar Pradesh)","destination": "New Delhi (Delhi)",    trainType: "Rajdhani", delayMinutes: 3, fare: { general: 500, ac: 1200, sleeper: 800 } },
  { trainNumber: "12953", trainName: "August Kranti Rajdhani",     source: "Mumbai (Maharashtra)",    destination: "New Delhi (Delhi)",         trainType: "Rajdhani", delayMinutes: 0, fare: { general: 820, ac: 1850, sleeper: 1220 } },
  { trainNumber: "16317", trainName: "Jayanti Janata Express",     source: "Kochi (Kerala)",          destination: "Mumbai (Maharashtra)",      trainType: "Express",   delayMinutes: 30,fare: { general: 600, ac: 1400, sleeper: 900 } },
  { trainNumber: "12029", trainName: "Amsterdam Shatabdi",         source: "New Delhi (Delhi)",       destination: "Jaipur (Rajasthan)",        trainType: "Shatabdi",  delayMinutes: 0, fare: { general: 400, ac: 900, sleeper: 650 } },
  { trainNumber: "12002", trainName: "Bhopal Shatabdi",            source: "New Delhi (Delhi)",       destination: "Bhopal (Madhya Pradesh)",   trainType: "Shatabdi",  delayMinutes: 5, fare: { general: 500, ac: 1100, sleeper: 750 } },
];

// ─── TAMIL NADU DISTRICT-TO-DISTRICT TRAINS ────────────────────────────────────
const tnTrains = [
  { trainNumber: "12601", trainName: "Chennai Express",           source: "Chennai",         destination: "Madurai",           trainType: "Express",   delayMinutes: 0,  fare: { general: 200, ac: 400, sleeper: 300 } },
  { trainNumber: "12602", trainName: "Chennai Superfast",         source: "Chennai",         destination: "Coimbatore",        trainType: "Superfast", delayMinutes: 5,  fare: { general: 180, ac: 360, sleeper: 280 } },
  { trainNumber: "12603", trainName: "Chennai-Salem Express",     source: "Chennai",         destination: "Salem",             trainType: "Express",   delayMinutes: 0,  fare: { general: 150, ac: 300, sleeper: 230 } },
  { trainNumber: "12604", trainName: "Chennai-Trichy Intercity",  source: "Chennai",         destination: "Tiruchirappalli",   trainType: "Express",   delayMinutes: 10, fare: { general: 170, ac: 340, sleeper: 260 } },
  { trainNumber: "12605", trainName: "Chennai-Erode Express",     source: "Chennai",         destination: "Erode",             trainType: "Express",   delayMinutes: 0,  fare: { general: 160, ac: 320, sleeper: 250 } },
  { trainNumber: "12606", trainName: "Chennai-Vellore Express",   source: "Chennai",         destination: "Vellore",           trainType: "Express",   delayMinutes: 3,  fare: { general: 80,  ac: 160, sleeper: 120 } },
  { trainNumber: "12607", trainName: "Chennai-Tirunelveli Mail",  source: "Chennai",         destination: "Tirunelveli",       trainType: "Express",   delayMinutes: 0,  fare: { general: 230, ac: 460, sleeper: 350 } },
  { trainNumber: "12608", trainName: "Chennai-Thanjavur Express", source: "Chennai",         destination: "Thanjavur",         trainType: "Express",   delayMinutes: 5,  fare: { general: 140, ac: 280, sleeper: 210 } },
  { trainNumber: "12609", trainName: "Chennai-Nagercoil Express", source: "Chennai",         destination: "Nagercoil",         trainType: "Express",   delayMinutes: 8,  fare: { general: 250, ac: 500, sleeper: 380 } },
  { trainNumber: "12610", trainName: "Chennai-Kanyakumari Exp",   source: "Chennai",         destination: "Kanyakumari",       trainType: "Express",   delayMinutes: 0,  fare: { general: 280, ac: 560, sleeper: 420 } },
  { trainNumber: "12701", trainName: "Coimbatore-Madurai Express",source: "Coimbatore",      destination: "Madurai",           trainType: "Express",   delayMinutes: 0,  fare: { general: 150, ac: 300, sleeper: 230 } },
  { trainNumber: "12702", trainName: "Coimbatore-Salem Express",  source: "Coimbatore",      destination: "Salem",             trainType: "Express",   delayMinutes: 2,  fare: { general: 120, ac: 240, sleeper: 180 } },
  { trainNumber: "12703", trainName: "Coimbatore-Erode Local",    source: "Coimbatore",      destination: "Erode",             trainType: "Local",     delayMinutes: 0,  fare: { general: 40,  ac: 70,  sleeper: 50  } },
  { trainNumber: "12704", trainName: "Coimbatore-Trichy Express", source: "Coimbatore",      destination: "Tiruchirappalli",   trainType: "Express",   delayMinutes: 0,  fare: { general: 130, ac: 260, sleeper: 200 } },
  { trainNumber: "12705", trainName: "Coimbatore-Thanjavur Exp",  source: "Coimbatore",      destination: "Thanjavur",         trainType: "Express",   delayMinutes: 4,  fare: { general: 180, ac: 360, sleeper: 270 } },
  { trainNumber: "12801", trainName: "Madurai-Salem Express",     source: "Madurai",         destination: "Salem",             trainType: "Express",   delayMinutes: 2,  fare: { general: 160, ac: 320, sleeper: 240 } },
  { trainNumber: "12802", trainName: "Madurai-Tirunelveli Express",source:"Madurai",         destination: "Tirunelveli",       trainType: "Express",   delayMinutes: 0,  fare: { general: 120, ac: 240, sleeper: 180 } },
  { trainNumber: "12803", trainName: "Madurai-Trichy Express",    source: "Madurai",         destination: "Tiruchirappalli",   trainType: "Express",   delayMinutes: 0,  fare: { general: 90,  ac: 180, sleeper: 140 } },
  { trainNumber: "12804", trainName: "Madurai-Kanyakumari Local", source: "Madurai",         destination: "Kanyakumari",       trainType: "Local",     delayMinutes: 5,  fare: { general: 100, ac: 160, sleeper: 130 } },
  { trainNumber: "12805", trainName: "Madurai-Erode Express",     source: "Madurai",         destination: "Erode",             trainType: "Express",   delayMinutes: 0,  fare: { general: 150, ac: 300, sleeper: 230 } },
  { trainNumber: "12901", trainName: "Salem-Trichy Express",      source: "Salem",           destination: "Tiruchirappalli",   trainType: "Express",   delayMinutes: 0,  fare: { general: 100, ac: 200, sleeper: 150 } },
  { trainNumber: "12902", trainName: "Salem-Erode Local",         source: "Salem",           destination: "Erode",             trainType: "Local",     delayMinutes: 0,  fare: { general: 50,  ac: 80,  sleeper: 60  } },
  { trainNumber: "13001", trainName: "Trichy-Thanjavur Local",    source: "Tiruchirappalli", destination: "Thanjavur",         trainType: "Local",     delayMinutes: 0,  fare: { general: 60,  ac: 100, sleeper: 70  } },
  { trainNumber: "13002", trainName: "Trichy-Tirunelveli Express",source: "Tiruchirappalli", destination: "Tirunelveli",       trainType: "Express",   delayMinutes: 3,  fare: { general: 110, ac: 220, sleeper: 170 } },
  { trainNumber: "13003", trainName: "Erode-Thanjavur Express",   source: "Erode",           destination: "Thanjavur",         trainType: "Express",   delayMinutes: 0,  fare: { general: 140, ac: 280, sleeper: 210 } },
  { trainNumber: "13004", trainName: "Vellore-Chennai Passenger", source: "Vellore",         destination: "Chennai",           trainType: "Local",     delayMinutes: 0,  fare: { general: 80,  ac: 140, sleeper: 110 } },
];

const allTrainData = [...nationalTrains, ...tnTrains];

const seedDatabase = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/trackmytrain';
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ MongoDB connected');

    // ── Clear  ──────────────────────────────────────────────────────────────────
    await Train.deleteMany({});
    await User.deleteMany({});
    console.log('🗑️  Cleared existing trains and users');

    // ── Seed Users ──────────────────────────────────────────────────────────────
    const adminUser = new User({
      username: 'admin',
      email: 'admin@demo.com',
      password: 'Admin@123',
      firstName: 'Admin',
      lastName: 'Control',
      role: 'admin',
    });

    const demoUser = new User({
      username: 'testuser',
      email: 'user@demo.com',
      password: 'User@123',
      firstName: 'Rahul',
      lastName: 'Sharma',
      role: 'user',
    });

    await adminUser.save();
    await demoUser.save();
    console.log('👤 Created users:');
    console.log('   Admin  → admin@demo.com  / Admin@123');
    console.log('   User   → user@demo.com   / User@123');

    // ── Seed Trains ─────────────────────────────────────────────────────────────
    const statuses = ['Running', 'Running', 'Running', 'Delayed', 'Scheduled'];

    const trainsWithDetails = allTrainData.map((train, index) => ({
      ...train,
      isActive: true,
      status: statuses[index % statuses.length],
      currentStation: train.source.split(' (')[0],
      currentLocation: {
        latitude: 13.08 + (Math.random() - 0.5) * 5,
        longitude: 80.27 + (Math.random() - 0.5) * 5,
        lastUpdated: new Date(),
      },
      capacity: train.capacity || { total: 500, available: 250 },
      amenities: train.amenities || ['WiFi', 'Food', 'AC'],
      schedule: {
        departureTime: new Date(Date.now() + index * 3600000),
        arrivalTime:   new Date(Date.now() + (index + 4) * 3600000),
        duration: 180 + Math.floor(Math.random() * 180),
        frequency: 'daily',
      },
      route: [
        {
          stationName: train.source.split(' (')[0] + ' Junction',
          stationCode: train.source.split(' (')[0].substring(0, 3).toUpperCase(),
          arrivalTime: new Date(Date.now() + index * 3600000),
          departureTime: new Date(Date.now() + index * 3600000 + 600000),
          distance: 0,
          platform: Math.floor(Math.random() * 8) + 1,
        },
        {
          stationName: train.destination.split(' (')[0] + ' Junction',
          stationCode: train.destination.split(' (')[0].substring(0, 3).toUpperCase(),
          arrivalTime: new Date(Date.now() + (index + 4) * 3600000),
          departureTime: new Date(Date.now() + (index + 4) * 3600000 + 600000),
          distance: Math.floor(Math.random() * 800) + 50,
          platform: Math.floor(Math.random() * 8) + 1,
        },
      ],
      operator: 'Indian Railways',
    }));

    const result = await Train.insertMany(trainsWithDetails, { ordered: false });
    console.log(`\n✅ Added ${result.length} trains (${nationalTrains.length} national + ${tnTrains.length} TN district)`);

    await mongoose.connection.close();
    console.log('✅ Seeding done!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

seedDatabase();

# TrackMyTrain - Train Tracking Application
## Complete Full-Stack Solution

### 📱 Application Overview
TrackMyTrain is a comprehensive real-time train tracking and information system providing users with accurate schedules, live location tracking, notifications, and offline access to essential travel data.

### 🎯 Core Features
for running process for code USE BELOW!!!!!
use the terminal 
step1: cd backend
step2: npm install
Step3: npm run dev

#### 1. **Train Information Module**
- Train number, name, route details
- Schedule information (departure, arrival times)
- Train type and amenities
- Fare structure
- Current status and delay information

#### 2. **Live Tracking Module**
- Real-time train location with GPS coordinates
- Current station information
- Next station details
- Visual map integration
- Status updates (Running, Delayed, Cancelled, Scheduled)

#### 3. **User Authentication**
- Secure login/registration with JWT tokens
- Password hashing with bcryptjs
- Profile management
- User preferences
- Emergency contacts

#### 4. **Notifications System**
- Push notifications for delays
- Arrival alerts
- Cancellation notices
- Booking confirmations
- Notification preferences

#### 5. **Saved Trains**
- Quick access to frequently tracked trains
- Bookmarks and favorites
- Historical tracking data

#### 6. **Offline Support**
- Service Worker caching for App Shell
- API data caching (Network-First)
- Offline fallback page

---

## 📂 Project Structure

```
train1 web/
├── backend/
│   ├── config/
│   │   └── db.js                 (MongoDB configuration)
│   ├── models/
│   │   ├── Train.js              (Train schema with comprehensive fields)
│   │   ├── User.js               (User authentication & profile)
│   │   ├── Notification.js        (Notifications with auto-delete)
│   │   └── OfflineSync.js         (Offline sync tracking)
│   ├── controllers/
│   │   ├── trainController.js    (Train operations & live tracking)
│   │   ├── authController.js     (Authentication & profile)
│   │   └── notificationController.js (Notification management)
│   ├── routes/
│   │   ├── trainRoutes.js        (Train API endpoints)
│   │   ├── authRoutes.js         (Auth endpoints)
│   │   └── notificationRoutes.js (Notification endpoints)
│   ├── middleware/
│   │   └── auth.js               (JWT verification & role-based access)
│   ├── package.json
│   ├── server.js                 (Express server setup)
│   └── .env                      (Environment variables)
│
└── frontend/
    ├── index.html                (Complete mobile-responsive SPA)
    └── package.json
```

---

## 🔧 Installation & Setup

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
echo "MONGO_URI=mongodb://localhost:27017/trackmytrain
JWT_SECRET=your-secret-key-here
NODE_ENV=development
PORT=3000" > .env

# Start server
npm start
```

### Frontend Setup

```bash
cd frontend

# Use Node's http-server
npx http-server -p 8000
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update profile (protected)

### Trains
- `GET /api/trains` - Get all trains
- `GET /api/trains?search=...` - Search trains by source/destination
- `GET /api/trains/:id` - Get train details
- `GET /api/trains/:id/location` - Get real-time location
- `POST /api/trains/:id/save` - Save train to favorites (protected)
- `GET /api/trains/user/saved` - Get saved trains (protected)
- `POST /api/trains` - Create train (admin only)
- `PUT /api/trains/:id/status` - Update train status (admin only)

### Notifications
- `GET /api/notifications` - Get user notifications (protected)
- `GET /api/notifications/unread-count` - Get unread count
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/mark-all-read` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

---

## 🗄️ Database Schema

### Train Collection
```javascript
{
  trainNumber: String,
  trainName: String,
  source: String,
  destination: String,
  route: [{
    stationName: String,
    stationCode: String,
    arrivalTime: Date,
    departureTime: Date,
    distance: Number,
    platform: String
  }],
  currentStation: String,
  currentLocation: {
    latitude: Number,
    longitude: Number,
    lastUpdated: Date
  },
  status: String,
  delayMinutes: Number,
  trainType: String,
  amenities: [String]
}
```

### User Collection
```javascript
{
  username: String,
  email: String,
  password: String (hashed),
  firstName: String,
  lastName: String,
  phoneNumber: String,
  savedTrains: [ObjectId],
  preferences: {
    notifications: Boolean,
    language: String,
    theme: String
  }
}
```


---

## 🔐 Security Features

- ✅ JWT-based authentication
- ✅ Password hashing with bcryptjs
- ✅ Role-based access control (RBAC)
- ✅ Protected API endpoints
- ✅ CORS configuration
- ✅ Input validation

---

## 📊 Testing with Sample Data

### Add a Test Train (using curl)
```bash
curl -X POST http://localhost:3000/api/trains \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "trainNumber": "12601",
    "trainName": "Chennai Express",
    "source": "Chennai",
    "destination": "Madurai",
    "trainType": "Express",
    "status": "Running",
    "delayMinutes": 0,
    "capacity": {"total": 500, "available": 250},
    "amenities": ["WiFi", "Food", "AC"]
  }'
```

### Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

---

## 🚀 Future Enhancements

### Phase 2 - AI & Advanced Features
- **AI-Based Delay Prediction** using historical data and ML models
- **Ticket Booking Integration** with payment gateway
- **Voice Assistant Support** for hands-free operation
- **Multi-Language Support** (10+ languages)
- **Advanced Search Filters** (price, duration, amenities)

### Phase 3 - Mobile Apps
- **Android App** (Java/Kotlin with Room Database for offline)
- **iOS App** (Swift with Core Data)
- **Native push notifications** with FCM/APNs

### Phase 4 - Analytics
- **Real-time dashboard** for admin
- **User analytics** and behavior tracking
- **Delay trend analysis**
- **Performance metrics**

---

## 📱 Frontend Features

- 🎨 Beautiful gradient UI design
- 📱 Mobile-responsive layout (480px optimized)
- 🔐 JWT token-based authentication
- 🔍 Real-time train search
- 📍 Live location tracking
- 🔔 Real-time notifications
- ⭐ Save trains for quick access
- 👤 User profile management
- 🌙 Dark mode support (ready)
- ⚡ Fast and smooth animations

---

## 🛠️ Technology Stack

**Frontend:**
- HTML5, CSS3, Vanilla JavaScript
- Mobile-first responsive design
- LocalStorage for token management

**Backend:**
- Node.js & Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- bcryptjs for password hashing

**Offline Support:**
- Service Worker (v11)
- Cache Storage API

---

## 📧 API Documentation

All endpoints require JSON content type and follow RESTful conventions.

### Response Format
```json
{
  "message": "Success message",
  "data": {},
  "error": null
}
```

### Error Handling
```json
{
  "error": "Error message",
  "status": 400
}
```

---

## 🐛 Troubleshooting

**MongoDB Connection Failed**
- Ensure MongoDB is running: `mongod`
- Check connection string in `.env`

**API Not Responding**
- Verify backend is running on port 3000
- Check `npm start` output for errors

**Frontend Not Loading Data**
- Open browser console for errors
- Ensure CORS is enabled
- Verify Bearer token in requests

**Port Already in Use**
- Change PORT in `.env` file
- Or kill process: `lsof -ti:3000 | xargs kill`

---

## 📝 License
Open Source - Feel free to use and modify

---

## 👨‍💻 Development Team
TrackMyTrain Project Team

---

**Version:** 1.0.0  
**Last Updated:** 2026-03-30  
**Status:** ✅ Production Ready

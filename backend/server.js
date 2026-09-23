require('dotenv').config();

const express = require('express');
const cors = require('cors');

const connectDB = require('./config/db');

const bookingRoutes = require('./routes/bookingRoutes');
const authRoutes = require('./routes/authRoutes');
const workerRoutes = require('./routes/workerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'coop-gig-backend'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
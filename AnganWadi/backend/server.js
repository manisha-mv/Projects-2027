import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import childrenRoutes from './routes/children.js';
import attendanceRoutes from './routes/attendance.js';
import vaccinationRoutes from './routes/vaccination.js';
import { seedDatabase } from './seeder.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET missing in .env');
  process.exit(1);
}
if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI missing in .env');
  process.exit(1);
}

// CORS — allow all localhost ports (dev) and any deployed frontend
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    // Allow any localhost or 127.0.0.1 port
    if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight for all routes
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Anganwadi Backend API - Connected!' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/children', childrenRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/vaccination', vaccinationRoutes);

// DB Connect
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('MongoDB Connected');
    await seedDatabase();
  })
  .catch(err => console.error('MongoDB Error:', err));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;

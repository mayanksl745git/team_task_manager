const crypto = require('crypto');
console.log('Node version:', process.version);
console.log('Crypto test:', crypto.randomBytes(4).toString('hex'));
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');

dotenv.config();
console.log('MONGO_URI:', process.env.MONGO_URI ? 'FOUND' : 'UNDEFINED');
console.log('All env keys:', Object.keys(process.env).filter(k => !k.includes('npm')));

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const corsOptions = {
  origin: CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    data: { status: 'ok' },
    message: 'API is running',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    data: {},
    message: `Route ${req.originalUrl} not found`,
  });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({
    success: false,
    data: {},
    message: 'Internal server error',
  });
});

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

console.log('Loading routes...');
try {
  require('./routes/authRoutes');
  console.log('auth ok');
  require('./routes/userRoutes');
  console.log('user ok');
  require('./routes/projectRoutes');
  console.log('project ok');
  require('./routes/taskRoutes');
  console.log('task ok');
} catch(e) {
  console.error('Route load error:', e.message);
  process.exit(1);
}
startServer();

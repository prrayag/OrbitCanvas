require('dotenv').config({ path: '../.env' });

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const connectDB = require('./config/db');
const boardRoutes = require('./routes/boardRoutes');
const setupCanvasSocket = require('./sockets/canvasSocket');
const { initGemini } = require('./services/geminiService');

const app = express();
const server = http.createServer(app);

// Socket.io with CORS for Vite dev server
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST'],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
}));
app.use(express.json({ limit: '10mb' }));

// REST Routes
app.use('/api/boards', boardRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'orbit-server', timestamp: new Date().toISOString() });
});

// Initialize services
const PORT = process.env.PORT || 3001;

(async () => {
  // Connect to MongoDB
  await connectDB();

  // Initialize Gemini
  initGemini();

  // Setup Socket.io
  setupCanvasSocket(io);

  // Handle EADDRINUSE gracefully
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`✦ Port ${PORT} is already in use. Trying to free it...`);
      require('child_process').exec(`lsof -ti:${PORT} | xargs kill -9`, (killErr) => {
        setTimeout(() => {
          server.listen(PORT);
        }, 1000);
      });
    } else {
      console.error('✦ Server error:', err);
    }
  });

  // Start server
  server.listen(PORT, () => {
    console.log('');
    console.log('  ✦ ─────────────────────────────────────');
    console.log(`  ✦  Orbit Server running on port ${PORT}`);
    console.log('  ✦  REST API:  http://localhost:' + PORT + '/api');
    console.log('  ✦  Socket.io: ws://localhost:' + PORT);
    console.log('  ✦ ─────────────────────────────────────');
    console.log('');
  });
})();

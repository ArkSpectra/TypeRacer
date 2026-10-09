import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import textRoutes from './routes/textRoutes.js';
import { testConnection } from './config/db.js';
import { setupRaceSocket } from './sockets/raceHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Setup Socket.io with CORS
const io = new SocketIOServer(server, {
    cors: {
        origin: '*', // Allow all origins for seamless development & network testing
        methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
});

// Middleware
app.use(cors({
    origin: '*',
    credentials: true
}));
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/texts', textRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', serverTime: new Date().toISOString() });
});

// Initialize Socket.io race logic
setupRaceSocket(io);

// Start server
server.listen(PORT, async () => {
    console.log(`\n🏎️  ===============================================`);
    console.log(`🏁  TypeRacer Backend Server running on port ${PORT}`);
    console.log(`🌐  REST API: http://localhost:${PORT}/api/health`);
    console.log(`⚡  Socket.IO: Ready for real-time multiplayer connections`);
    console.log(`===============================================\n`);

    // Test MySQL database connection
    await testConnection();
});

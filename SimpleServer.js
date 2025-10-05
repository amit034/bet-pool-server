const express = require('express');
const { Server } = require("socket.io");
const path = require('path');
const http = require('http');

const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS headers for Google OAuth
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Serve static files
const publicPath = path.join(__dirname, 'client', 'src','frontend', 'public');
app.use(express.static(publicPath));

// Basic route
app.get('/', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

// Mock authentication endpoints for testing
app.post('/api/auth/google', (req, res) => {
    console.log('Google OAuth request received:', req.body);
    // Mock successful authentication
    const mockUser = {
        id: 1,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        apiAccessToken: 'mock-token-' + Date.now()
    };
    res.json(mockUser);
});

app.post('/api/auth/facebook', (req, res) => {
    console.log('Facebook OAuth request received:', req.body);
    // Mock successful authentication
    const mockUser = {
        id: 1,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        apiAccessToken: 'mock-token-' + Date.now()
    };
    res.json(mockUser);
});

app.post('/api/auth/login', (req, res) => {
    console.log('Login request received:', req.body);
    // Mock successful authentication
    const mockUser = {
        id: 1,
        email: req.body.email || 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        apiAccessToken: 'mock-token-' + Date.now()
    };
    res.json(mockUser);
});

app.post('/api/auth/register', (req, res) => {
    console.log('Register request received:', req.body);
    // Mock successful registration
    const mockUser = {
        id: 1,
        email: req.body.email || 'test@example.com',
        firstName: req.body.firstName || 'Test',
        lastName: req.body.lastName || 'User',
        apiAccessToken: 'mock-token-' + Date.now()
    };
    res.json(mockUser);
});

// Create HTTP server
const httpServer = http.createServer(app);

// Setup Socket.io
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on('connection', function(socket) {
    console.log('Client connected:', socket.id);
    
    socket.on('joinPool', (poolId) => {
        console.log(`Client ${socket.id} joined pool ${poolId}`);
        socket.join(poolId);
    });

    socket.on('leavePool', (poolId) => {
        console.log(`Client ${socket.id} left pool ${poolId}`);
        socket.leave(poolId);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Start server
httpServer.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    console.log(`Socket.io server ready for connections`);
});

module.exports = { app, io };

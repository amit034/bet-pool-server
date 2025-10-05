const { io } = require('socket.io-client');

console.log('Testing Socket.io connection...');

const socket = io('http://localhost:8081', {
    transports: ['polling', 'websocket']
});

socket.on('connect', () => {
    console.log('✅ Socket.io connected successfully!');
    console.log('Socket ID:', socket.id);
    process.exit(0);
});

socket.on('connect_error', (error) => {
    console.log('❌ Socket.io connection error:', error.message);
    process.exit(1);
});

socket.on('disconnect', (reason) => {
    console.log('❌ Socket.io disconnected:', reason);
    process.exit(1);
});

// Timeout after 5 seconds
setTimeout(() => {
    console.log('❌ Socket.io connection timeout');
    process.exit(1);
}, 5000);

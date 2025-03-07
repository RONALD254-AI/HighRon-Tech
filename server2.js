const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/chatApp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Error connecting to MongoDB:', err);
});

// Define the Message schema
const messageSchema = new mongoose.Schema({
    username: String,
    message: String,
    timestamp: { type: Date, default: Date.now },
});

const Message = mongoose.model('Message', messageSchema);

// Store connected users
const users = {};

// Socket.IO connection
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Listen for new user registration
    socket.on('register', async (username) => {
        users[socket.id] = username;
        io.emit('userJoined', `${username} has joined the chat!`);

        // Load previous messages from the database
        const messages = await Message.find().sort({ timestamp: 1 });
        socket.emit('loadMessages', messages); // Send previous messages to the new user
    });

    // Listen for chat messages
    socket.on('chatMessage', async (message) => {
        const username = users[socket.id];
        const newMessage = new Message({ username, message });
        await newMessage.save(); // Save the message to the database
        io.emit('message', { username, message }); // Broadcast the message to all users
    });

    // Handle user disconnect
    socket.on('disconnect', () => {
        const username = users[socket.id];
        if (username) {
            io.emit('userLeft', `${username} has left the chat.`);
            delete users[socket.id];
        }
    });
});

// Start the server on a different port
const PORT = process.env.PORT || 4000; // Use a different port than server.js
server.listen(PORT, () => {
    console.log(`Chat server is running on http://localhost:${PORT}`);
});
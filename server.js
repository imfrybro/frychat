// server.js
const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from /public
app.use(express.static(path.join(__dirname, 'public')));

// In-memory message history (for demo). Replace with DB for persistence.
let history = [];

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('connect', socket.id);

  socket.on('join', (username) => {
    socket.username = username || 'Anonymous';
    // send last 50 messages to the joining client
    socket.emit('history', history.slice(-50));
    io.emit('user-joined', { id: socket.id, username: socket.username });
  });

  socket.on('message', (text) => {
    if (typeof text !== 'string' || text.trim() === '') return;
    // basic sanitization: trim and limit length
    const msg = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      user: socket.username || 'Anonymous',
      text: text.trim().slice(0, 1000),
      time: new Date().toISOString()
    };
    history.push(msg);
    // keep history from growing unbounded (demo)
    if (history.length > 2000) history.shift();
    io.emit('message', msg); // broadcast to all
  });

  socket.on('disconnect', () => {
    io.emit('user-left', { id: socket.id, username: socket.username });
    console.log('disconnect', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));

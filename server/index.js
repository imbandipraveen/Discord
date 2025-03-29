import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import connectDB from './config/database.js';
import config from './config/config.js';
import authRoutes from './routes/auth.js';
import serverRoutes from './routes/server.js';
import chatRoutes from './routes/chat.js';
import friendRoutes from './routes/friend.js';

const app = express();
const port = config.port;

// Middleware
app.use(cors({
  origin: config.cors.origin
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Connect to Database
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/server', serverRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/friend', friendRoutes);

// Socket.io setup
const httpServer = createServer(app);
const io = new Server(httpServer, {
  pingTimeout: 20000,
  cors: {
    origin: config.cors.origin
  }
});

// Socket.io events
io.on("connection", (socket) => {
  socket.on('get_userid', (user_id) => {
    socket.join(user_id);
  });

  socket.on('send_req', (receiver_id, sender_id, sender_profile_pic, sender_name) => {
    socket.to(receiver_id).emit('recieve_req', { sender_name, sender_profile_pic, sender_id });
  });

  socket.on('req_accepted', (sender_id, friend_id, friend_name, friend_profile_pic) => {
    socket.to(friend_id).emit('req_accepted_notif', { sender_id, friend_name, friend_profile_pic });
  });

  socket.on('join_chat', (channel_id) => {
    socket.join(channel_id);
  });

  socket.on('send_message', (channel_id, message, timestamp, sender_name, sender_tag, sender_pic) => {
    socket.to(channel_id).emit('recieve_message', { message_data: { message, timestamp, sender_name, sender_tag, sender_pic } });
  });
});

// Start server
httpServer.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

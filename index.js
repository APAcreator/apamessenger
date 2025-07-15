const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST', 'DELETE'], credentials: true }
});

app.use(cors());
app.use(express.json());

mongoose.connect(
  'mongodb+srv://creator:APAgroup.pro193@cluster0.o1azkwr.mongodb.net/APAMessenger?retryWrites=true&w=majority&tls=true',
  { useNewUrlParser: true, useUnifiedTopology: true }
).then(() => console.log('✅ MongoDB connected'))
 .catch(err => console.error('❌ MongoDB error:', err));

const User = require('./models/User');
const Chat = require('./models/Chat');
const Message = require('./models/Message');

// ----------------- Пользователи -----------------
app.get('/api/users/search/:q', async (req, res) => {
  try {
    const users = await User.find({ username: { $regex: req.params.q, $options: 'i' } });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ----------------- Чаты -----------------
app.get('/api/chats/:userId', async (req, res) => {
  const chats = await Chat.find({ members: req.params.userId }).populate('members', 'username');
  res.json(chats);
});

app.post('/api/chats/create', async (req, res) => {
  const { userId, otherUserId } = req.body;
  if (!userId || !otherUserId) return res.status(400).json({ error: 'Нужны userId и otherUserId' });

  // проверим, есть ли уже чат
  const existing = await Chat.findOne({ members: { $all: [userId, otherUserId] } });
  if (existing) return res.json(existing);

  const chat = new Chat({ members: [userId, otherUserId] });
  await chat.save();
  res.json(chat);
});

app.delete('/api/chats/:id', async (req, res) => {
  try {
    await Chat.deleteOne({ _id: req.params.id });
    await Message.deleteMany({ chatId: req.params.id });
    res.json({ message: 'Чат и сообщения удалены' });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка при удалении' });
  }
});

app.get('/api/chats/messages/:chatId', async (req, res) => {
  const messages = await Message.find({ chatId: req.params.chatId });
  res.json(messages);
});

// ----------------- Сообщения -----------------
app.post('/api/messages/send', async (req, res) => {
  const { chatId, sender, text } = req.body;
  if (!chatId || !sender || !text) return res.status(400).json({ error: 'Недостаточно данных' });
  const msg = new Message({ chatId, sender, text });
  await msg.save();
  io.to(chatId).emit('receive_message', msg);
  res.json(msg);
});

// ----------------- Socket.IO -----------------
io.on('connection', (socket) => {
  socket.on('join_chat', (chatId) => { socket.join(chatId); });
  socket.on('send_message', (data) => { io.to(data.chatId).emit('receive_message', data); });
});

server.listen(5000, '0.0.0.0', () => console.log('🚀 Server running on port 5000'));

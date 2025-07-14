const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const Message = require('../models/Message');

// получить список чатов пользователя
router.get('/:userId', async (req, res) => {
  const chats = await Chat.find({ members: req.params.userId }).populate('members', 'username');
  res.json(chats);
});

// создать чат с другим пользователем
router.post('/create', async (req, res) => {
  const { userId, otherUserId } = req.body;
  let chat = await Chat.findOne({ members: { $all: [userId, otherUserId] } });
  if (!chat) {
    chat = new Chat({ members: [userId, otherUserId] });
    await chat.save();
  }
  res.json(chat);
});

// получить сообщения чата
router.get('/messages/:chatId', async (req, res) => {
  const messages = await Message.find({ chatId: req.params.chatId }).sort({ createdAt: 1 });
  res.json(messages);
});

module.exports = router;

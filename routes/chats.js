const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const Message = require('../models/Message');

// ✅ Получить список чатов пользователя
router.get('/:userId', async (req, res) => {
  try {
    const chats = await Chat.find({ members: req.params.userId }).populate('members', 'username');
    res.json(chats);
  } catch (err) {
    console.error('Ошибка при получении чатов:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ✅ Создать чат с другим пользователем
router.post('/', async (req, res) => {
  try {
    const { userId, otherUserId } = req.body;
    if (!userId || !otherUserId) {
      return res.status(400).json({ error: 'userId и otherUserId обязательны' });
    }
    let chat = await Chat.findOne({ members: { $all: [userId, otherUserId] } });
    if (!chat) {
      chat = new Chat({ members: [userId, otherUserId] });
      await chat.save();
    }
    res.json(chat);
  } catch (err) {
    console.error('Ошибка при создании чата:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ✅ Получить сообщения чата
router.get('/messages/:chatId', async (req, res) => {
  try {
    const messages = await Message.find({ chatId: req.params.chatId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    console.error('Ошибка при получении сообщений:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;

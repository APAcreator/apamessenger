// routes/messages.js
const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// отправить сообщение
router.post('/send', async (req, res) => {
  try {
    const { chatId, sender, text } = req.body;
    if (!chatId || !sender || !text) {
      return res.status(400).json({ error: 'Отсутствуют необходимые данные' });
    }
    const message = new Message({ chatId, sender, text });
    await message.save();
    return res.status(201).json(message);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;

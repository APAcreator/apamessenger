const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// отправить сообщение
router.post('/send', async (req, res) => {
  const { chatId, sender, text } = req.body;
  const message = new Message({ chatId, sender, text });
  await message.save();
  res.json(message);
});

module.exports = router;

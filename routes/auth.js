const express = require('express');
const router = express.Router();
const User = require('../models/User');

// регистрация
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username.startsWith('@')) return res.status(400).json({ error: 'Юзернейм должен начинаться с @' });
  const exists = await User.findOne({ username });
  if (exists) return res.status(400).json({ error: 'Имя уже занято' });
  const user = new User({ username, password });
  await user.save();
  res.json({ message: 'ok', userId: user._id });
});

// вход
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, password });
  if (!user) return res.status(401).json({ error: 'Неверные данные' });
  res.json({ userId: user._id, username: user.username });
});

// поиск по тегу
router.get('/search/:tag', async (req, res) => {
  const tag = req.params.tag;
  const users = await User.find({ username: new RegExp(tag, 'i') }).select('username');
  res.json(users);
});

module.exports = router;

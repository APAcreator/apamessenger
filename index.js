const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const bcrypt = require('bcrypt');

const User = require('./models/User');
const Chat = require('./models/Chat');
const Message = require('./models/Message');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET','POST','DELETE'],
    credentials: true
  }
});

app.use(cors());
app.use(express.json());

mongoose.connect(
  'mongodb+srv://creator:APAgroup.pro193@cluster0.o1azkwr.mongodb.net/APAMessenger?retryWrites=true&w=majority&tls=true',
  { useNewUrlParser: true, useUnifiedTopology: true }
).then(() => console.log('✅ MongoDB connected'))
 .catch(err => console.error('❌ MongoDB error:', err));

app.post('/api/auth/register', async (req,res)=>{
  try{
    const {username,password} = req.body;
    if(!username || !password) return res.status(400).json({error:'Нужны username и password'});
    const exists = await User.findOne({username});
    if(exists) return res.status(400).json({error:'Такой пользователь уже есть'});
    const hash = await bcrypt.hash(password,10);
    const user = new User({username,password:hash});
    await user.save();
    res.json({message:'Регистрация успешна',userId:user._id});
  }catch(e){console.error(e);res.status(500).json({error:'Ошибка сервера'});}
});

app.post('/api/auth/login', async (req,res)=>{
  try{
    const {username,password} = req.body;
    const user = await User.findOne({username});
    if(!user) return res.status(400).json({error:'Неверный логин или пароль'});
    const ok = await bcrypt.compare(password,user.password);
    if(!ok) return res.status(400).json({error:'Неверный логин или пароль'});
    res.json({message:'Вход успешен',userId:user._id});
  }catch(e){console.error(e);res.status(500).json({error:'Ошибка сервера'});}
});

app.get('/api/users/search/:q', async (req,res)=>{
  try{
    const users = await User.find({username:{$regex:req.params.q,$options:'i'}});
    res.json(users);
  }catch(e){console.error(e);res.status(500).json({error:'Ошибка сервера'});}
});

app.get('/api/chats/:userId', async (req,res)=>{
  try{
    const chats = await Chat.find({members:req.params.userId}).populate('members','username');
    res.json(chats);
  }catch(e){console.error(e);res.status(500).json({error:'Ошибка сервера'});}
});

app.post('/api/chats/create', async (req,res)=>{
  try{
    const {userId,otherUserId} = req.body;
    if(!userId || !otherUserId) return res.status(400).json({error:'Нужны userId и otherUserId'});
    const existing = await Chat.findOne({members:{$all:[userId,otherUserId]}});
    if(existing) return res.json(existing);
    const chat = new Chat({members:[userId,otherUserId]});
    await chat.save();
    res.json(chat);
  }catch(e){console.error(e);res.status(500).json({error:'Ошибка сервера'});}
});

app.delete('/api/chats/:id', async (req,res)=>{
  try{
    await Chat.deleteOne({_id:req.params.id});
    await Message.deleteMany({chatId:req.params.id});
    res.json({message:'Чат и сообщения удалены'});
  }catch(e){console.error(e);res.status(500).json({error:'Ошибка при удалении'});}
});

app.get('/api/chats/messages/:chatId', async (req,res)=>{
  try{
    const messages = await Message.find({chatId:req.params.chatId}).sort({createdAt:1});
    res.json(messages);
  }catch(e){console.error(e);res.status(500).json({error:'Ошибка сервера'});}
});

app.post('/api/messages/send', async (req,res)=>{
  try{
    const {chatId,sender,text} = req.body;
    if(!chatId || !sender || !text) return res.status(400).json({error:'Недостаточно данных'});
    const msg = new Message({chatId,sender,text,createdAt:new Date()});
    await msg.save();
    io.to(chatId).emit('receive_message',msg);
    res.json(msg);
  }catch(e){console.error(e);res.status(500).json({error:'Ошибка сервера'});}
});

io.on('connection',(socket)=>{
  socket.on('join_chat',(chatId)=>{socket.join(chatId);});
  socket.on('send_message',(data)=>{io.to(data.chatId).emit('receive_message',data);});
});

app.get('/',(req,res)=>{res.json({status:'ok',message:'API работает'});});
app.use((req,res)=>{res.status(404).json({error:'Маршрут не найден'});});

server.listen(5000,'0.0.0.0',()=>console.log('🚀 Server running on port 5000'));

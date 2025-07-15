const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true
  }
});

app.use(cors());
app.use(express.json());

// ✅ Подключение к БД
mongoose.connect(
  "mongodb+srv://creator:APAgroup.pro193@cluster0.o1azkwr.mongodb.net/APAMessenger?retryWrites=true&w=majority&tls=true",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
).then(() => console.log("✅ MongoDB connected (APAMessenger)"))
 .catch(err => console.log("❌ MongoDB error:", err));

// ✅ Socket
io.on("connection", (socket) => {
  console.log("🔌 Новый клиент подключен:", socket.id);

  socket.on("send_message", (data) => {
    console.log("📩 Получено сообщение:", data);
    io.emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("❌ Клиент отключен:", socket.id);
  });
});

// ✅ Роуты
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
const chatsRoutes = require("./routes/chats"); // 👈 добавил роут для чатов

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/chats", chatsRoutes); // 👈 теперь чаты обрабатываются тут

// ✅ Проверка сервера
app.get("/", (req, res) => {
  res.json({ status: "APA Messenger Backend Running" });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

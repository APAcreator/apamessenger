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

// MongoDB
mongoose.connect(
  "mongodb+srv://creator:APAgroup.pro193@cluster0.o1azkwr.mongodb.net/?retryWrites=true&w=majority&tls=true",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
).then(() => console.log("✅ MongoDB connected"))
 .catch(err => console.log("❌ MongoDB error:", err));

// Socket events
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

// Routes
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

app.get("/", (req, res) => {
  res.send("APA Messenger Backend Running");
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

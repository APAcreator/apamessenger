const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const socketIO = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: "*"
    }
});

app.use(cors());
app.use(express.json());

// MongoDB (исправлено: удалён параметр appName из URI)
mongoose.connect("mongodb+srv://creator:APAgroup.pro193@cluster0.o1azkwr.mongodb.net/?retryWrites=true&w=majority&tls=true", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// Socket events
io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    socket.on("send_message", (data) => {
        io.emit("receive_message", data);
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
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
server.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));

import express from "express";
import cors from "cors";
import fileUpload from "express-fileupload";
import http from "http";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import db from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import userRoutes from "./routes/userRoutes.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:5173", credentials: true },
});

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(fileUpload());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api", userRoutes);
const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("🟢 Client connected:", socket.id);

  socket.on("setup", (userData) => {
    if (!userData?.id) return;

    socket.join(userData.id);
    socket.userId = userData.id;
    socket.userData = userData;

    if (!onlineUsers.has(userData.id)) {
      onlineUsers.set(userData.id, userData);
      console.log(`✅ ${userData.username} joined`);
    }

    socket.emit("connected");
    io.emit("online_users", Array.from(onlineUsers.values()));
  });

  
  socket.on("join_chat", ({ chatId }) => {
    console.log(`🔗 ${socket.userId} joined chat room: ${chatId}`);
    socket.join(chatId);
  });

  socket.on("send_message", (msg) => {
    if (!msg?.chatId) return;
    console.log(`📨 ${msg.senderId} sent message to chat ${msg.chatId}`);
    socket.to(msg.chatId).emit("message received", msg);
  });

  socket.on("typing", ({ chatId, userId }) => {
    socket.to(chatId).emit("typing", { userId });
  });

  socket.on("stop_typing", ({ chatId, userId }) => {
    socket.to(chatId).emit("stop_typing", { userId });
  });

  socket.on("react_message", ({ msgId, emoji }) => {
    io.emit("message_reacted", { msgId, emoji });
  });
  socket.on("disconnect", () => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
      io.emit("online_users", Array.from(onlineUsers.values()));
      console.log(`🔴 Disconnected: ${socket.userId}`);
    }
  });
});


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

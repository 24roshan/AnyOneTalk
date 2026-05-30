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
import groupRoutes from "./routes/groupRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://any-one-talk.vercel.app",
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket"],
});

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use(
  fileUpload({
    useTempFiles: true,
  }),
);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("AnyoneTalk Backend Running 🚀");
});

app.use("/api/auth", authRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api", userRoutes);

const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("✅ Client connected:", socket.id);

  socket.on("setup", (userData) => {
    if (!userData?.id) return;

    socket.join(userData.id);

    socket.userId = userData.id;
    socket.userData = userData;

    if (!onlineUsers.has(userData.id)) {
      onlineUsers.set(userData.id, userData);
      console.log(`🟢 ${userData.username} joined`);
    }

    socket.emit("connected");

    io.emit("online_users", Array.from(onlineUsers.values()));
  });

  socket.on("join_chat", ({ chatId }) => {
    if (!chatId) return;

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

  socket.on("edit_message", ({ id, newContent }) => {
    if (!id || !newContent) return;

    db.query(
      "UPDATE messages SET content = ?, edited = 1 WHERE id = ?",
      [newContent, id],
      (err) => {
        if (err) {
          console.error("❌ Error editing message:", err);
          return;
        }

        console.log(`✏️ Message ${id} edited`);

        io.emit("messageEdited", { id, newContent });
      },
    );
  });

  socket.on("delete_message", ({ id }) => {
    if (!id) return;

    db.query("UPDATE messages SET deleted = 1 WHERE id = ?", [id], (err) => {
      if (err) {
        console.error("❌ Error deleting message:", err);
        return;
      }

      console.log(`🗑️ Message ${id} deleted`);

      io.emit("messageDeleted", { id });
    });
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

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

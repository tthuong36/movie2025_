import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import http from "http";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";

import routes from "./src/routes/index.js";
import paymentRoutes from "./src/routes/paymentRoutes.js";
import videoRoute from "./src/routes/video.routes.js";
import tmdbProxyRoutes from "./src/routes/tmdb.proxy.route.js";

// ----------------------------------------------------
// KHỞI TẠO EXPRESS & HTTP SERVER
// ----------------------------------------------------
const app = express();
const port = process.env.PORT || 5000;
const server = http.createServer(app);

// ----------------------------------------------------
// CORS CONFIG – BẢN HOÀN CHỈNH
// ----------------------------------------------------
const allowedOrigins = [
  "http://localhost:3000",
  "https://movie2025-me3hox7luz-tthuong36-projects.vercel.app"
];

// KHÔNG DÙNG CALLBACK PHỨC TẠP, TRÁNH BUG CORS
const corsOptions = {
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
};

// Áp dụng CORS cho toàn bộ Express
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// ----------------------------------------------------
// MIDDLEWARES
// ----------------------------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// ----------------------------------------------------
// TMDB PROXY ROUTE
// ----------------------------------------------------
app.use("/api/proxy/tmdb", tmdbProxyRoutes);

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------
app.use("/api/payment", paymentRoutes);
app.use("/api/v1", routes);
app.use("/api/v1/videos", videoRoute);

// ----------------------------------------------------
// TEST ROUTE
// ----------------------------------------------------
app.get("/", (req, res) => {
  res.send("Backend server is running!");
});

// ----------------------------------------------------
// SOCKET.IO – DÙNG CORS ĐỒNG NHẤT VỚI EXPRESS
// ----------------------------------------------------
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// SOCKET.IO EVENTS
io.on("connection", (socket) => {
  console.log(`Socket User connected: ${socket.id}`);

  socket.on("joinRoom", (data) => {
    const { roomId, userId, username } = data;
    socket.join(roomId);

    socket.to(roomId).emit("userJoined", {
      message: `Người dùng ${username} đã tham gia.`,
      userId,
      isSystem: true
    });
  });

  socket.on("syncPlayPause", (data) => {
    const { roomId, action, currentTime, senderId } = data;
    socket.to(roomId).emit("mediaAction", { action, currentTime, senderId });
  });

  socket.on("syncSeek", (data) => {
    socket.to(data.roomId).emit("mediaSeek", { seekTime: data.seekTime });
  });

  socket.on("send_message", (data) => {
    io.to(data.roomId).emit("receive_message", {
      senderId: data.senderId,
      senderName: data.senderName,
      text: data.text,
      timestamp: Date.now(),
      isSystem: false
    });
  });

  socket.on("disconnecting", () => {
    socket.rooms.forEach((roomID) => {
      if (roomID !== socket.id) {
        socket.to(roomID).emit("user_left", {
          message: `Một người dùng đã rời phòng.`,
          userId: socket.id,
          isSystem: true
        });
      }
    });
  });
});

// ----------------------------------------------------
// GLOBAL ERROR HANDLER
// ----------------------------------------------------
app.use((err, req, res, next) => {
  console.error("LỖI CHƯA ĐƯỢC BẮT:", err);
  res.status(500).json({
    message: "Lỗi Server Nội bộ.",
    error: err.message
  });
});

// ----------------------------------------------------
// CONNECT DATABASE & START SERVER
// ----------------------------------------------------
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("Mongodb connected");
    server.listen(port, () =>
      console.log(`Server is listening on port ${port}`)
    );
  })
  .catch((err) => {
    console.log({ err });
    process.exit(1);
  });

export default app;

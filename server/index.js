import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import http from "http";
import mongoose from "mongoose";
// Tất cả các dòng 'dotenv' import và config đã được XÓA
// (Đã chuyển sang cờ -r trong package.json để tránh xung đột ESM)
import { Server } from "socket.io"; 
import { v4 as uuidv4 } from 'uuid'; // Dùng cho các tác vụ tạo ID

import routes from "./src/routes/index.js"; 
import paymentRoutes from "./src/routes/paymentRoutes.js"; 
import videoRoute from "./src/routes/video.routes.js"; 

// ----------------------------------------------------
// KHỞI TẠO EXPRESS VÀ HTTP SERVER
// ----------------------------------------------------
const app = express();
const port = process.env.PORT || 5000;
const server = http.createServer(app); // Tạo HTTP server từ ứng dụng Express

// ----------------------------------------------------
// CẤU HÌNH CORS CHUNG
// ----------------------------------------------------
const allowedOrigins = [
    'http://localhost:3000', 
    'https://movie2025-me3hox7luz-tthuong36-projects.vercel.app' // Domain Vercel của bạn
];

const corsOptions = {
    origin: (origin, callback) => {
        // Cho phép các yêu cầu từ domain được liệt kê hoặc không có origin (ví dụ: Postman)
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'), false);
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
};

// ----------------------------------------------------
// KHỞI TẠO SOCKET.IO SERVER (REAL-TIME)
// ----------------------------------------------------
const io = new Server(server, {
    // ✅ Áp dụng CORS Options cho Socket.IO
    cors: corsOptions
});

// ----------------------------------------------------
// MIDDLEWARES CƠ BẢN VÀ CẤU HÌNH EXPRESS
// ----------------------------------------------------

// ✅ FIX 1: Xử lý Preflight OPTIONS request TƯỜNG MINH
app.options('*', cors(corsOptions)); 

// ✅ FIX 2: Áp dụng CORS cho mọi Route
app.use(cors(corsOptions));

app.use(express.json()); // Xử lý body JSON (cho API)
app.use(express.urlencoded({ extended: false })); // Xử lý body form URL
app.use(cookieParser()); // Xử lý cookies

// ----------------------------------------------------
// ĐỊNH TUYẾN (ROUTING) API
// ----------------------------------------------------
app.use('/api/payment', paymentRoutes);
app.use("/api/v1", routes); // Route chính của ứng dụng
app.use("/api/v1/videos", videoRoute); // Route cho video


app.get('/', (req, res) => {
    res.send('Backend server is running!');
});

// ----------------------------------------------------
// LOGIC XỬ LÝ WATCH PARTY SOCKET.IO (REAL-TIME SYNC)
// ----------------------------------------------------
io.on('connection', (socket) => {
    console.log(`Socket User connected: ${socket.id}`);

    // Sự kiện: Người dùng tham gia phòng
    socket.on('joinRoom', (data) => {
        const { roomId, userId, username } = data;
        socket.join(roomId); // Gắn socket vào phòng
        console.log(`User ${username} (ID: ${userId}) joined Room: ${roomId}`);
        
        // Thông báo cho những người còn lại trong phòng (socket.to)
        socket.to(roomId).emit('userJoined', { 
            message: `Người dùng ${username} đã tham gia.`,
            userId: userId,
            isSystem: true 
        });
    });

    // Sự kiện: Đồng bộ Play/Pause (Host gửi lên)
    socket.on('syncPlayPause', (data) => {
        const { roomId, action, currentTime, senderId } = data;
        
        // Gửi lệnh Play/Pause/Timestamp đến tất cả người dùng khác trong phòng (socket.to)
        socket.to(roomId).emit('mediaAction', {
            action: action, 
            currentTime: currentTime, 
            senderId: senderId
        });
    });

    // Sự kiện: Đồng bộ Seek (Tua video)
    socket.on('syncSeek', (data) => {
        const { roomId, seekTime } = data;
        
        // Gửi vị trí tua đến tất cả người dùng khác
        socket.to(roomId).emit('mediaSeek', { seekTime });
    });
    
    // Sự kiện: Chat trong phòng
    socket.on('send_message', (data) => {
        const { roomId, senderId, senderName, text } = data;
        
        // Gửi tin nhắn đến tất cả mọi người trong phòng (io.to)
        io.to(roomId).emit('receive_message', {
            senderId,
            senderName,
            text,
            timestamp: new Date().getTime(),
            isSystem: false
        });
    });
    
    // Sự kiện: Người dùng ngắt kết nối (Rời phòng)
    socket.on('disconnecting', () => {
        // Lặp qua tất cả các phòng mà socket này đang tham gia
        socket.rooms.forEach(roomID => {
            if (roomID !== socket.id) {
                // Thông báo cho những người còn lại trong phòng
                socket.to(roomID).emit('user_left', { 
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
    console.error("LỖI CHƯA ĐƯỢC BẮT (Global Error Handler):", err);
    res.status(500).json({
        message: "Lỗi Server Nội bộ. Vui lòng kiểm tra log.",
        error: err.message
    });
});

// ----------------------------------------------------
// KẾT NỐI DATABASE VÀ KHỞI CHẠY SERVER
// ----------------------------------------------------
mongoose.connect(process.env.MONGODB_URL).then(() => { 
    console.log("Mongodb connected");
    server.listen(port, () => {
        console.log(`Server is listening on port ${port}`);
    });
}).catch((err) => {     
    console.log({ err });
    process.exit(1); // Thoát ứng dụng nếu lỗi kết nối DB
});
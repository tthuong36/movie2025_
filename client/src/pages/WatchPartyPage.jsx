import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, Stack, Grid, CircularProgress } from '@mui/material';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import useSocket from '../hooks/useSocket'; // Sử dụng Hook (đã trỏ đến 5000)
import WatchPartyChat from '../components/common/WatchPartyChat'; // Import khung chat
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';

const WatchPartyPage = () => {
    const { roomID } = useParams(); 
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.user);
    
    // Lấy dữ liệu được truyền từ MediaDetail.jsx (qua Modal)
    const { mediaId, mediaTitle, videoUrl, isLocal } = location.state || {};

    // 1. Kết nối Socket.IO
    const { socket, isConnected, emitEvent } = useSocket(roomID);
    const videoRef = useRef(null);

    // 2. Xử lý nếu không có dữ liệu (ví dụ: người dùng F5 hoặc gõ URL trực tiếp)
    useEffect(() => {
        if (!videoUrl) {
            toast.error("Lỗi: Không tìm thấy video. Đang điều hướng về trang chủ.");
            setTimeout(() => {
                navigate('/');
            }, 3000);
        }
    }, [videoUrl, navigate]);

    // 3. Logic đồng bộ hóa (Gửi lệnh)
    const handleSyncPlayPause = (action) => {
        if (!videoRef.current || !isConnected || !isLocal) return;
        emitEvent('syncPlayPause', { 
            roomId: roomID, 
            action, 
            currentTime: videoRef.current.currentTime,
            senderId: socket.id
        });
    };
    const handleSyncSeek = () => {
        if (!videoRef.current || !isConnected || !isLocal) return;
        emitEvent('syncSeek', { 
            roomId: roomID, 
            seekTime: videoRef.current.currentTime 
        });
    };

    // 4. Lắng nghe lệnh (Nhận lệnh)
    useEffect(() => {
        if (!socket || !isLocal) return; // Chỉ đồng bộ nếu là video local
        if (!videoRef.current) return;

        const video = videoRef.current;

        video.onplay = () => handleSyncPlayPause('play');
        video.onpause = () => handleSyncPlayPause('pause');
        video.onseeked = handleSyncSeek;

        socket.on('mediaAction', ({ action, senderId, currentTime }) => {
            if (socket.id !== senderId) { 
                video.currentTime = currentTime; 
                if (action === 'play') video.play();
                else if (action === 'pause') video.pause();
            }
        });
        socket.on('mediaSeek', ({ seekTime }) => {
            video.currentTime = seekTime;
        });

        return () => {
            video.onplay = null;
            video.onpause = null;
            video.onseeked = null;
            socket.off('mediaAction');
            socket.off('mediaSeek');
        };
    }, [socket, isLocal, roomID, emitEvent]);

    // Giao diện Loading (nếu videoUrl chưa kịp tải)
    if (!videoUrl) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'black' }}>
                <CircularProgress />
            </Box>
        );
    }

    // Giao diện chính
    return (
        <Box sx={{ p: 2, height: '100vh', backgroundColor: 'black' }}>
            <Typography variant="h5" sx={{ color: 'white', mb: 1 }}>
                Phòng Xem Chung: {roomID}
            </Typography>
            <Typography variant="body1" sx={{ color: 'gray', mb: 2 }}>
                Đang xem: {mediaTitle} (ID: {mediaId})
            </Typography>

            <Grid container spacing={2} sx={{ height: 'calc(100% - 80px)' }}>
                {/* Cột Video Player */}
                <Grid item xs={12} md={9} sx={{ height: '100%' }}>
                    {isLocal ? (
                        // SỬA LỖI VIDEO: Gán videoUrl vào src
                        <video 
                            ref={videoRef}
                            src={videoUrl} 
                            controls 
                            style={{ width: '100%', height: 'auto', maxHeight: '85vh', backgroundColor: '#111' }}
                        />
                    ) : (
                        // SỬA LỖI TRAILER: Gán videoUrl vào src
                        <iframe
                            src={videoUrl}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title="Trailer"
                            style={{ width: '100%', height: '85vh', backgroundColor: '#111' }}
                        />
                    )}
                </Grid>

                {/* Cột Chat Box */}
                <Grid item xs={12} md={3} sx={{ height: { xs: '400px', md: '85vh' } }}>
                    {/* THÊM KHUNG CHAT */}
                    {isConnected && user ? (
                        <WatchPartyChat socket={socket} roomId={roomID} />
                    ) : (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', border: '1px solid #333', borderRadius: 1 }}>
                           <CircularProgress />
                           <Typography sx={{ color: 'white', ml: 2 }}>Đang kết nối chat...</Typography>
                        </Box>
                    )}
                </Grid>
            </Grid>
        </Box>
    );
};

export default WatchPartyPage;
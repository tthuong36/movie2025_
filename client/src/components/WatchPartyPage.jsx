import React, { useEffect, useRef, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import io from 'socket.io-client';
import { Box, Typography, Alert, Stack, CircularProgress, Button } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import Hls from 'hls.js'; // ✨ IMPORT HLS.JS

const SOCKET_SERVER_URL = 'http://localhost:5000'; 

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

// Hàm tiện ích: Tái tạo logic đồng bộ chính xác
const syncPlayback = (videoEl, timestamp, action) => {
    // Đặt thời gian chính xác trước khi thực hiện lệnh
    videoEl.currentTime = timestamp; 
    
    // Thêm độ trễ nhỏ để tránh giật lag khi đồng bộ (50ms)
    setTimeout(() => {
        if (action === 'PLAY') {
            videoEl.play().catch(e => console.error("Play error:", e));
        } else if (action === 'PAUSE' || action === 'SEEK') {
            videoEl.pause();
        }
    }, 50); 
}

const WatchPartyPage = () => {
  const { roomID } = useParams(); // Lấy Room ID từ URL path
  const query = useQuery();
  const mediaId = query.get('mediaId'); // Lấy Media ID từ query params
  
  const videoRef = useRef(null); // Ref để truy cập trình phát video HTML5
  const socketRef = useRef(null); // Ref để truy cập Socket.IO Client
  
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [isHost, setIsHost] = useState(true); // Giả định người tạo phòng là Host
  const [isPlaying, setIsPlaying] = useState(false); // Trạng thái phát

  // Giả định: URL video được lấy từ Media ID
  // ✨ THAY THẾ URL NÀY bằng đường dẫn HLS/DASH thực tế
  const videoSource = `http://link-den-kho-phim-cua-ban/${mediaId}/master.m3u8`; 

  // --- LOGIC SOCKET.IO, ĐỒNG BỘ VIDEO VÀ HLS.JS ---
  useEffect(() => {
    if (!roomID || !mediaId) {
      setLoading(false);
      return;
    }
    
    // Khởi tạo HLS.JS
    const video = videoRef.current;
    let hls;

    if (video) {
        if (Hls.isSupported()) {
            hls = new Hls();
            hls.loadSource(videoSource);
            hls.attachMedia(video);
            
            hls.on(Hls.Events.MEDIA_ATTACHED, function () {
                console.log("HLS: Media attached.");
            });
            
            hls.on(Hls.Events.ERROR, function (event, data) {
                if (data.fatal) {
                    console.error("HLS Fatal Error:", data);
                }
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            // Hỗ trợ nguyên bản trên Safari
            video.src = videoSource;
        }
    }

    // 1. Kết nối Socket.IO
    socketRef.current = io(SOCKET_SERVER_URL);

    socketRef.current.on('connect', () => {
      console.log(`Connected with ID: ${socketRef.current.id}`);
      setLoading(false);
      
      // 2. Gửi lệnh Tham gia phòng
      socketRef.current.emit('join_room', { 
        roomID, 
        mediaId, 
        userId: socketRef.current.id 
      });

      // 3. Lắng nghe các lệnh đồng bộ
      socketRef.current.on('receive_command', (data) => {
        const { action, timestamp, senderId } = data;
        const videoEl = videoRef.current; 

        if (videoEl && senderId !== socketRef.current.id) { // Chỉ thực hiện nếu lệnh đến từ người khác
          console.log(`[Sync] Received ${action} at ${timestamp} from ${senderId}`);
          syncPlayback(videoEl, timestamp, action);
             if (action === 'PLAY') setIsPlaying(true);
             if (action === 'PAUSE' || action === 'SEEK') setIsPlaying(false);
        }
      });
      
      // 4. Lắng nghe thông báo người dùng
      socketRef.current.on('user_joined', (data) => {
        setMessages(prev => [...prev, data.message]);
      });

      socketRef.current.on('user_left', (data) => {
        setMessages(prev => [...prev, data.message]);
      });
    });
    
    // Lắng nghe sự kiện PLAY/PAUSE từ trình phát để cập nhật trạng thái UI
    if (video) {
        const updateState = () => setIsPlaying(!video.paused);
        video.addEventListener('play', updateState);
        video.addEventListener('pause', updateState);
    }


    // Clean-up: Ngắt kết nối khi component bị unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (hls) {
          hls.destroy(); // Dọn dẹp HLS.js
      }
    };
  }, [roomID, mediaId, videoSource]); // Thêm videoSource vào dependencies

  // Hàm gửi lệnh đồng bộ lên Server (Chỉ Host mới gọi)
  const sendCommand = (action) => {
    const video = videoRef.current;
    if (!video || !socketRef.current || !isHost) return;

    socketRef.current.emit('send_command', {
      roomID,
      action, // 'PLAY', 'PAUSE', 'SEEK'
      timestamp: video.currentTime,
      senderId: socketRef.current.id
    });
    console.log(`[Host] Sent ${action} at ${video.currentTime}`);
  };

  // Xử lý các sự kiện từ trình phát video (Chỉ Host)
  const handleHostAction = (action) => {
    if (isHost) {
      if (action === 'PLAY') {
             videoRef.current.play(); // Kích hoạt hành động cục bộ
             sendCommand('PLAY');
          }
      if (action === 'PAUSE') {
             videoRef.current.pause(); // Kích hoạt hành động cục bộ
             sendCommand('PAUSE');
          }
    }
  };

  const handleSeek = () => {
    if (isHost) {
      sendCommand('SEEK'); 
      if (!videoRef.current.paused) {
         sendCommand('PLAY'); // Gửi lại PLAY để đảm bảo đồng bộ trạng thái phát sau khi tua
      }
    }
  };
  // --------------------------------------------------

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography>Đang kết nối phòng xem chung...</Typography>
      </Box>
    );
  }

  if (!roomID || !mediaId) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">Thông tin phòng hoặc phim không hợp lệ.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: '1200px', margin: '0 auto', color: 'text.primary' }}>
      <Typography variant="h4" gutterBottom>
        <PeopleIcon sx={{ mr: 1 }} /> Phòng Xem Chung: {roomID}
      </Typography>
      <Typography variant="h6" color="primary.main" gutterBottom>
        Đang xem Media ID: {mediaId}
      </Typography>

      {/* Video Player */}
      <Box sx={{ my: 3, position: 'relative', width: '100%', aspectRatio: '16/9', bgcolor: 'black' }}>
        <video 
          ref={videoRef}
          controls={isHost} // Chỉ Host mới điều khiển được
          onPlay={() => handleHostAction('PLAY')}
          onPause={() => handleHostAction('PAUSE')}
          onSeeked={handleSeek} // Khi người dùng tua video xong
          width="100%"
          // KHÔNG GÁN SRC Ở ĐÂY. HLS.JS SẼ GẮN
          muted={!isHost} // Tắt tiếng thành viên khi vào phòng
          autoPlay 
        />
        
        {/* Nút Điều khiển Tùy chỉnh (Cho thành viên không phải Host) */}
        {!isHost && (
            <Stack 
                direction="row" spacing={2} justifyContent="center" alignItems="center"
                sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
            >
                <Button 
                  variant="contained" 
                  color={isPlaying ? 'error' : 'success'}
                  disabled 
                  startIcon={isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                >
                    {isPlaying ? 'Đang Phát' : 'Đang chờ Host'}
                </Button>
            </Stack>
        )}
      </Box>

      {/* Thông báo phòng (Chat/Hệ thống) */}
      <Box sx={{ mt: 3, height: '150px', overflowY: 'scroll', border: '1px solid gray', p: 1, borderRadius: 1 }}>
        <Typography variant="subtitle2">Thông báo phòng:</Typography>
        {messages.map((msg, index) => (
          <Typography key={index} variant="body2" sx={{ color: 'gray' }}>
            {msg}
          </Typography>
        ))}
        <Typography variant="body2" color="primary.main">
            {isHost ? "Bạn là Host (có quyền điều khiển)." : "Bạn là Thành viên (Host điều khiển video)."}
        </Typography>
      </Box>
      
      {/* Tùy chọn: Thêm chức năng Chat tại đây */}

    </Box>
  );
};

export default WatchPartyPage;
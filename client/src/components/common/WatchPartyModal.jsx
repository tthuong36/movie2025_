// src/components/common/WatchPartyModal.jsx

import React, { useState } from 'react';
import { Box, Modal, Button, TextField, Typography, Stack, Divider, CircularProgress, useTheme } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PeopleIcon from '@mui/icons-material/People';
import AddIcon from '@mui/icons-material/Add';
import LoginIcon from '@mui/icons-material/Login';
import { toast } from 'react-toastify';

// Phong cách cơ bản cho Modal
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: 300, sm: 400, md: 450 },
  bgcolor: 'background.default', // Sử dụng màu nền mặc định của theme
  border: '2px solid',
  borderColor: 'primary.main',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
  color: 'text.primary'
};

const WatchPartyModal = ({ mediaId, mediaTitle, onClose }) => {
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  // Hàm xử lý tạo phòng mới
  const handleCreateRoom = async () => {
    if (loading) return;
    setLoading(true);

    try {
        // ✨ BƯỚC 1: Gọi API Backend (HTTP) để tạo Room ID
        // THAY THẾ bằng logic gọi API thực tế của bạn
        // const response = await fetch('/api/watchparty/create', { ... });
        // const data = await response.json();
        // const NEW_ROOM_ID = data.roomId; 
        
        // Mã giả định:
        await new Promise(resolve => setTimeout(resolve, 500)); // Giả lập độ trễ API
        const NEW_ROOM_ID = `WP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`; 
        
        toast.success(`Phòng "${NEW_ROOM_ID}" đã được tạo!`);

        // ✨ BƯỚC 2: Chuyển hướng người dùng đến trang Watch Party
        window.location.href = `/watch-party/${NEW_ROOM_ID}?mediaId=${mediaId}`; 
    } catch (error) {
        toast.error("Lỗi khi tạo phòng. Vui lòng thử lại.");
        console.error("Lỗi tạo phòng:", error);
        setLoading(false);
    }
  };

  // Hàm xử lý tham gia phòng
  const handleJoinRoom = () => {
    if (roomCode.trim().length > 0) {
      // ✨ Chuyển hướng người dùng tới trang Watch Party với mã nhập
      window.location.href = `/watch-party/${roomCode.trim()}?mediaId=${mediaId}`;
    } else {
        toast.warn("Vui lòng nhập Mã Phòng.");
    }
  };

  return (
    <Modal
      open={true}
      onClose={onClose}
      aria-labelledby="watch-party-modal-title"
      sx={{ '& .MuiBackdrop-root': { backdropFilter: 'blur(3px)' } }} // Làm mờ nền
    >
      <Box sx={modalStyle}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography id="watch-party-modal-title" variant="h5" component="h2" color="primary.main">
            <PeopleIcon sx={{ mr: 1, verticalAlign: 'middle' }} /> Watch Party
            </Typography>
            <Button onClick={onClose} sx={{ minWidth: 0, p: 0 }}><CloseIcon /></Button>
        </Stack>
        
        <Typography variant="h6" mb={2}>
            "{mediaTitle}"
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* Lựa chọn 1: TẠO PHÒNG MỚI */}
        <Stack spacing={1} mb={4}>
            <Typography variant="body1">
                Bắt đầu một buổi xem chung mới!
            </Typography>
            <Button 
                variant="contained" 
                size="large"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
                onClick={handleCreateRoom} 
                disabled={loading}
            >
                TẠO PHÒNG MỚI
            </Button>
        </Stack>
        
        {/* Lựa chọn 2: THAM GIA PHÒNG */}
        <Typography variant="subtitle1" mb={1} fontWeight="bold">
            Hoặc Tham gia phòng hiện có
        </Typography>
        <Stack direction="row" spacing={1} alignItems="stretch">
            <TextField
                label="Mã Phòng (Room Code)"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                fullWidth
                size="small"
                variant="outlined"
            />
            <Button 
                variant="outlined" 
                onClick={handleJoinRoom} 
                disabled={roomCode.trim().length === 0}
                startIcon={<LoginIcon />}
            >
                Tham Gia
            </Button>
        </Stack>
      </Box>
    </Modal>
  );
};

export default WatchPartyModal;
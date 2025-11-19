import React, { useState, useEffect, useRef } from 'react';
import { Box, Paper, TextField, Button, Typography, Chip, Stack, CircularProgress } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useSelector } from 'react-redux';
import { red } from '@mui/material/colors';

/**
 * Component Chat Real-time cho phòng xem chung.
 * Nhận props từ WatchPartyPage: socket và roomId.
 */
const WatchPartyChat = ({ socket, roomId }) => {
    // Lấy thông tin user (đã đăng nhập)
    const { user } = useSelector((state) => state.user);
    
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const messagesEndRef = useRef(null); 

    // Hàm tự động cuộn xuống tin nhắn mới nhất
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // 1. Lắng nghe sự kiện từ Socket
    useEffect(() => {
        if (!socket) return;

        const messageListener = (message) => {
            setMessages((prevMessages) => [...prevMessages, message]);
        };
        
        // Lắng nghe các sự kiện hệ thống (userJoined, user_left)
        const systemListener = (data) => {
            setMessages((prevMessages) => [...prevMessages, { ...data, isSystem: true, timestamp: Date.now() }]);
        };

        socket.on('receive_message', messageListener);
        socket.on('userJoined', systemListener);
        socket.on('user_left', systemListener);

        // Cleanup: Gỡ bỏ listeners khi component unmount
        return () => {
            socket.off('receive_message', messageListener);
            socket.off('userJoined', systemListener);
            socket.off('user_left', systemListener);
        };
    }, [socket]);

    // Tự động cuộn khi có tin nhắn mới (trigger bằng độ dài mảng)
    useEffect(() => {
        scrollToBottom();
    }, [messages.length]); 

    // 2. Gửi tin nhắn
    const handleSendMessage = () => {
        if (!inputMessage.trim() || !user || !socket) return;

        const messageData = {
            roomId: roomId,
            senderId: user.id, 
            senderName: user.displayName, 
            text: inputMessage.trim(),
        };

        // Gửi sự kiện 'send_message' lên Backend
        socket.emit('send_message', messageData);
        
        setInputMessage('');
    };

    // UI Loading State
    if (!user || !socket) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', bgcolor: '#1e1e1e' }}>
                <CircularProgress size={20} sx={{ color: red[500] }} />
                <Typography sx={{ color: 'white', ml: 2 }}>Đang kết nối...</Typography>
            </Box>
        );
    }

    return (
        <Paper 
            elevation={3} 
            sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                backgroundColor: '#1e1e1e',
                color: 'white' 
            }}
        >
            {/* Tiêu đề khung chat */}
            <Box sx={{ p: 2, borderBottom: '1px solid #444', backgroundColor: '#252525' }}>
                <Typography variant="h6" color="primary.main">Chat Phòng</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Mã Phòng: {roomId}</Typography>
            </Box>

            {/* Vùng hiển thị tin nhắn */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, '&::-webkit-scrollbar': { width: '4px' } }}>
                <Stack spacing={1.5}>
                    {messages.map((msg, index) => (
                        <Box 
                            key={index} 
                            sx={{ 
                                textAlign: msg.isSystem ? 'center' : (msg.senderId === user.id ? 'right' : 'left'),
                            }}
                        >
                            {/* Tin nhắn hệ thống (Tham gia/Rời) */}
                            {msg.isSystem ? (
                                <Chip 
                                    label={msg.message || `Thông báo hệ thống`}
                                    size="small"
                                    sx={{ bgcolor: '#333', color: '#ccc', fontStyle: 'italic', maxWidth: '80%' }}
                                />
                            ) : (
                                <>
                                    {/* Tên người gửi (nếu không phải mình) */}
                                    {msg.senderId !== user.id && (
                                        <Typography variant="caption" sx={{ color: '#ccc', display: 'block', mr: 1, fontWeight: 'bold' }}>
                                            {msg.senderName}
                                        </Typography>
                                    )}
                                    
                                    {/* Nội dung tin nhắn */}
                                    <Chip 
                                        label={msg.text} 
                                        color={msg.senderId === user.id ? 'primary' : 'secondary'}
                                        sx={{
                                            height: 'auto',
                                            '& .MuiChip-label': {
                                                display: 'block',
                                                whiteSpace: 'normal',
                                                padding: '6px 10px',
                                                fontSize: '0.9rem'
                                            },
                                            maxWidth: '95%'
                                        }}
                                    />
                                </>
                            )}
                        </Box>
                    ))}
                    {/* Div trống để tham chiếu cuộn */}
                    <div ref={messagesEndRef} />
                </Stack>
            </Box>

            {/* Vùng nhập liệu */}
            <Box sx={{ p: 2, display: 'flex', gap: 1, borderTop: '1px solid #444', backgroundColor: '#252525' }}>
                <TextField
                    fullWidth
                    size="small"
                    variant="outlined"
                    placeholder="Nhập tin nhắn..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    sx={{ 
                        backgroundColor: '#333',
                        borderRadius: 1,
                        '& .MuiOutlinedInput-root': {
                            color: 'white',
                            '& fieldset': { borderColor: '#555' },
                            '&:hover fieldset': { borderColor: 'primary.main' },
                        }
                    }}
                />
                <Button 
                    variant="contained" 
                    onClick={handleSendMessage} 
                    disabled={!inputMessage.trim()}
                    sx={{ minWidth: '50px', bgcolor: red[700], '&:hover': { bgcolor: red[900] } }}
                >
                    <SendIcon />
                </Button>
            </Box>
        </Paper>
    );
};

export default WatchPartyChat;
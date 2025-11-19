import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

// SỬA LỖI: URL phải trỏ đến Backend Server (Port 5000)
const SOCKET_URL = 'http://localhost:5000'; 

const useSocket = (roomId) => {
    const socketRef = useRef(null); 
    const [isConnected, setIsConnected] = useState(false);
    
    useEffect(() => {
        // Khởi tạo kết nối ĐẾN ĐÚNG SERVER (Port 5000)
        socketRef.current = io(SOCKET_URL, { 
            withCredentials: true 
        });

        socketRef.current.on('connect', () => {
            setIsConnected(true);
            console.log(`Socket connected: ${socketRef.current.id}`);
            
            if (roomId) {
                socketRef.current.emit('joinRoom', { 
                    roomId: roomId, 
                    userId: 'USER_ID_CUA_BAN', // Cần thay thế
                    username: 'TEN_NGUOI_DUNG' // Cần thay thế
                });
            }
        });

        socketRef.current.on('disconnect', () => {
            setIsConnected(false);
            console.log('Socket disconnected');
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [roomId]);

    const emitEvent = (eventName, data) => {
        if (socketRef.current && isConnected) {
            socketRef.current.emit(eventName, data);
        }
    };
    
    return { 
        socket: socketRef.current, 
        isConnected, 
        emitEvent 
    };
};

export default useSocket;
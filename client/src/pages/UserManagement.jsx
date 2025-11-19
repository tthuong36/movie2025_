import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Typography, 
    CircularProgress, 
    Paper, 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    IconButton,
    Alert,
    Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';


import axiosClient from '../api/client/private.client.js';
import { red, green } from '@mui/material/colors';
import { toast } from 'react-toastify';


const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- LOGIC FETCH DỮ LIỆU ---
    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            // SỬ DỤNG ENDPOINT BẢO VỆ DÀNH CHO ADMIN
            const response = await axiosClient.get('/users/admin'); 
            
            // Giả định backend trả về mảng users trong response.data
            setUsers(response.data || response); 
            
        } catch (err) {
            console.error("Lỗi Fetch Users:", err);
            // Hiển thị lỗi rõ ràng nếu không có quyền truy cập
            const message = err.response?.data?.message || "Không thể tải danh sách người dùng. Vui lòng kiểm tra quyền Admin.";
            setError(message);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // --- LOGIC XÓA NGƯỜI DÙNG ---
    const handleDelete = async (userId, userName) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa người dùng: ${userName}?`)) {
            return;
        }

        try {
            setLoading(true);
            // SỬ DỤNG ENDPOINT DELETE, BACKEND PHẢI CÓ MIDDLEWARE KIỂM TRA QUYỀN ADMIN
            await axiosClient.delete(`/users/${userId}`); 
            
            toast.success(`Đã xóa người dùng: ${userName}`);
            fetchUsers(); // Tải lại danh sách
            
        } catch (err) {
            console.error("Lỗi Delete User:", err);
            const message = err.response?.data?.message || `Không thể xóa người dùng: ${userName}`;
            toast.error(message);
        }
    };

    // --- RENDER UI ---

    if (loading) {
        return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress color="primary" /></Box>;
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h5" component="h1" gutterBottom>
                Quản lý Người dùng ({users.length})
            </Typography>

            <Paper elevation={3} sx={{ mt: 3, overflow: 'hidden' }}>
                <TableContainer>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow sx={{ '& th': { bgcolor: '#222', color: 'white', fontWeight: 'bold' } }}>
                                <TableCell>ID Người dùng</TableCell>
                                <TableCell>Tên hiển thị</TableCell>
                                <TableCell>Username</TableCell>
                                <TableCell align="center">Quyền</TableCell>
                                <TableCell align="center">Hành động</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody sx={{ '& td': { color: 'white', borderColor: '#333' }, bgcolor: '#1e1e1e' }}>
                            {users.map((user) => (
                                <TableRow key={user.id} hover>
                                    <TableCell sx={{ fontSize: '0.8rem' }}>{user.id}</TableCell>
                                    <TableCell>{user.displayName}</TableCell>
                                    <TableCell>{user.username}</TableCell>
                                    <TableCell align="center">
                                        <Tooltip title={user.role === 'admin' ? "Quản trị viên" : "Thành viên"}>
                                            {/* Giả định role được trả về là 'admin' hoặc 'user' */}
                                            {user.role === 'admin' ? (
                                                <CheckCircleIcon sx={{ color: green[500] }} />
                                            ) : (
                                                <CancelIcon sx={{ color: red[500] }} />
                                            )}
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell align="center">
                                        <IconButton 
                                            color="error" 
                                            onClick={() => handleDelete(user.id, user.username)}
                                            // Ngăn chặn xóa tài khoản Admin để đảm bảo an toàn
                                            disabled={user.role === 'admin'} 
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
};

export default UserManagement;
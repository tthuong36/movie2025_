import React from 'react';
import { Box, CssBaseline, Toolbar } from '@mui/material';
import { Outlet, Navigate } from 'react-router-dom'; // Dùng cho React Router v6
import AdminSidebar from '../admin/AdminSidebar.jsx';
import { useSelector } from 'react-redux'; // Dùng để kiểm tra quyền Admin

const drawerWidth = 240;

const AdminLayout = () => {
    // ⚠️ ĐẢM BẢO LOGIC KIỂM TRA QUYỀN ADMIN TẠI ĐÂY
    // Giả định: Lấy trạng thái người dùng từ Redux store
    const { user, authLoading } = useSelector((state) => state.user); 
    
    // Nếu đang tải thông tin user, hiển thị loading
    if (authLoading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white' }}>Đang tải...</Box>;
    }

    // Nếu không có user hoặc user không phải admin, chuyển hướng về trang chủ
    if (!user || user.role !== 'admin') {
        return <Navigate to="/" replace />;
    }
    
    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#121212', color: 'white' }}>
            <CssBaseline />
            
            {/* Thanh điều hướng cố định */}
            <AdminSidebar drawerWidth={drawerWidth} />
            
            {/* Khu vực nội dung chính */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    width: `calc(100% - ${drawerWidth}px)`,
                    ml: `${drawerWidth}px`, // Đẩy nội dung chính sang phải
                    p: 3,
                }}
            >
                {/* Toolbar trống giúp đẩy nội dung xuống dưới Topbar (nếu có Topbar) */}
                <Toolbar /> 
                
                {/* Outlet render các trang con (User Management, Video Management, v.v.) */}
                <Outlet /> 
            </Box>
        </Box>
    );
};

export default AdminLayout;
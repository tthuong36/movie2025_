import React from 'react';
import { Box, Typography } from '@mui/material';

const AdminDashboard = () => {
    return (
        <Box>
            <Typography variant="h4" color="primary">Tổng Quan Hệ Thống</Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>Trang này sẽ hiển thị các thống kê chính.</Typography>
        </Box>
    );
};

export default AdminDashboard;
import React from 'react';
import { Box, Typography } from '@mui/material';

const VideoManagement = () => {
    return (
        <Box>
            <Typography variant="h4" color="primary">Quản Lý Video Nội Bộ</Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>Trang này sẽ cho phép thêm, sửa, xóa các video trong kho nội bộ.</Typography>
        </Box>
    );
};

export default VideoManagement;
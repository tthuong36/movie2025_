import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';

const AdminGuard = ({ children }) => {
    const { user, loading } = useSelector((state) => state.user); 

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />; 
    }

    if (user.role !== 'admin') {
        return <Navigate to="/" replace />; 
    }

    return <>{children}</>;
};

export default AdminGuard;
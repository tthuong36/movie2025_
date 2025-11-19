import React from 'react';
import { Box, Typography, Button, Paper, useTheme } from '@mui/material';
import { CheckCircleOutline } from '@mui/icons-material'; // Icon cho thành công
import { useNavigate } from 'react-router-dom'; // Để điều hướng

const ThankYouPage = () => {
    const theme = useTheme();
    const navigate = useNavigate();

    // Hàm xử lý khi nhấn nút "Quay lại trang quyên góp"
    const handleGoBackToDonate = () => {
        navigate('/donate'); // Chuyển hướng về trang quyên góp
    };

    return (
        <Box
            sx={{
                padding: theme.spacing(4),
                maxWidth: 700,
                margin: '20px auto', // Canh giữa trang
                minHeight: 'calc(100vh - 100px)', // Đảm bảo đủ chiều cao
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                [theme.breakpoints.down('sm')]: {
                    padding: theme.spacing(2),
                    margin: '10px auto',
                },
            }}
        >
            <Paper
                elevation={3}
                sx={{
                    padding: theme.spacing(4),
                    width: '100%',
                    borderRadius: theme.shape.borderRadius,
                    backgroundColor: theme.palette.background.paper,
                    textAlign: 'center', // Canh giữa các text
                }}
            >
                <CheckCircleOutline sx={{ fontSize: 80, color: theme.palette.success.main, mb: 3 }} />
                <Typography variant="h3" gutterBottom component="h1" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                    Giao dịch thành công!
                </Typography>
                <Typography variant="h5" paragraph sx={{ color: theme.palette.text.secondary, mb: 4 }}>
                    Cảm ơn bạn đã donate cho TT cute! ❤️
                </Typography>
                <Typography variant="body1" paragraph sx={{ color: theme.palette.text.secondary, mb: 4 }}>
                    Sự ủng hộ của bạn là nguồn động lực to lớn giúp chúng tôi tiếp tục phát triển.
                </Typography>

                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleGoBackToDonate}
                    size="large"
                    sx={{ py: 1.5, px: 4, fontWeight: 700 }}
                >
                    Quay lại trang quyên góp
                </Button>
            </Paper>
        </Box>
    );
};

export default ThankYouPage;

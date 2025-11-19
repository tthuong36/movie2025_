import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    TextField,
    useTheme,
    Grid,
    Paper,
    Divider,
    Alert, // Thêm Alert để hiển thị thông báo
} from '@mui/material';
import { FavoriteBorderOutlined, AttachMoneyOutlined } from '@mui/icons-material';

const DonatePage = () => {
    const theme = useTheme();
    const [amount, setAmount] = useState(''); // State cho số tiền nhập thủ công
    const [selectedAmount, setSelectedAmount] = useState(''); // State cho số tiền chọn từ nút
    const [name, setName] = useState(''); // State cho tên người quyên góp
    const [message, setMessage] = useState(''); // State cho lời nhắn

    const [paymentResult, setPaymentResult] = useState({ show: false, message: '', isSuccess: false });
    const navigate = useNavigate();

    const predefinedAmounts = [
        { value: 50000, label: '50.000 VNĐ' },
        { value: 100000, label: '100.000 VNĐ' },
        { value: 200000, label: '200.000 VNĐ' },
        { value: 500000, label: '500.000 VNĐ' },
        { value: 1000000, label: '1.000.000 VNĐ' },
    ];

    // Hàm xử lý thanh toán VNPay
    const handleVNPayPayment = async () => {
        const finalAmount = amount || selectedAmount;
        if (!finalAmount || finalAmount <= 0) {
            setPaymentResult({ show: true, message: "Vui lòng nhập hoặc chọn số tiền hợp lệ để quyên góp.", isSuccess: false });
            return;
        }

        setPaymentResult({ show: true, message: "Đang chuyển đến trang thanh toán VNPay...", isSuccess: false });

        const orderId = `DONATE_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const orderInfo = `Quyen gop: ${finalAmount} VND. Ten: ${name || 'Khach an danh'}. Loi nhan: ${message || 'Khong co loi nhan'}`;

        try {
            // Gọi API backend để tạo URL thanh toán VNPay
            const response = await fetch('http://localhost:5000/api/payment/create_vnpay', { // Đảm bảo đúng URL backend của bạn
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: finalAmount, // Sử dụng finalAmount
                    orderId: orderId,
                    orderInfo: orderInfo,
                }),
            });

            const result = await response.json();

            if (response.ok && result.code === "00") {
                // Mở trang thanh toán VNPay trong một tab mới
                window.open(result.data, '_blank');
                setPaymentResult({ show: false, message: '', isSuccess: false }); // Xóa thông báo chờ
                // Reset form sau khi chuyển hướng thành công
                setAmount('');
                setSelectedAmount('');
                setName('');
                setMessage('');
            } else {
                setPaymentResult({ show: true, message: "Lỗi khi khởi tạo thanh toán VNPay: " + result.message, isSuccess: false });
            }
        } catch (error) {
            setPaymentResult({ show: true, message: "Lỗi kết nối đến server: " + error.message, isSuccess: false });
        }
    };

    // useEffect để xử lý kết quả trả về từ cổng thanh toán (sau khi người dùng được redirect về)
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const orderIdParam = urlParams.get('orderId');
        const messageParam = urlParams.get('message');
        const vnp_ResponseCode = urlParams.get('vnp_ResponseCode');
        const momo_errorCode = urlParams.get('errorCode'); // Giữ lại nếu bạn có thể có callback từ MoMo

        if (orderIdParam) {
            if (vnp_ResponseCode) {
                if (vnp_ResponseCode === '00') {
                    setPaymentResult({ show: true, message: `Giao dịch VNPay cho đơn hàng ${orderIdParam} thành công!`, isSuccess: true });
                } else {
                    setPaymentResult({ show: true, message: `Giao dịch VNPay cho đơn hàng ${orderIdParam} thất bại: ${messageParam || 'Lỗi không xác định'}`, isSuccess: false });
                }
                navigate('/donate', { replace: true }); // Chỉnh sửa URL trả về nếu cần
            } else if (momo_errorCode) {
                if (momo_errorCode === '0') {
                    setPaymentResult({ show: true, message: `Giao dịch MoMo cho đơn hàng ${orderIdParam} thành công!`, isSuccess: true });
                } else {
                    setPaymentResult({ show: true, message: `Giao dịch MoMo cho đơn hàng ${orderIdParam} thất bại: ${messageParam || 'Lỗi không xác định'}`, isSuccess: false });
                }
                navigate('/donate', { replace: true }); // Chỉnh sửa URL trả về nếu cần
            }
        }
    }, [navigate]); // navigate là dependency của useEffect này

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
                <AttachMoneyOutlined sx={{ fontSize: 60, color: theme.palette.primary.main, mb: 2 }} />
                <Typography variant="h4" gutterBottom component="h1" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                    Cảm Ơn Sự Ủng Hộ Của Bạn!
                </Typography>
                <Typography variant="body1" paragraph sx={{ color: theme.palette.text.secondary, mb: 3 }}>
                    Sự đóng góp của bạn giúp chúng tôi duy trì và phát triển dự án này. Mọi khoản ủng hộ đều vô cùng quý giá!
                </Typography>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" gutterBottom sx={{ color: theme.palette.text.primary, mb: 2 }}>
                    Chọn số tiền quyên góp:
                </Typography>
                <Grid container spacing={2} justifyContent="center" mb={3}>
                    {predefinedAmounts.map((item) => (
                        <Grid item key={item.value}>
                            <Button
                                variant={selectedAmount === item.value ? 'contained' : 'outlined'}
                                color="primary"
                                onClick={() => {
                                    setSelectedAmount(item.value);
                                    setAmount(''); // Xóa số tiền nhập thủ công
                                }}
                                sx={{
                                    minWidth: '120px',
                                    height: '50px',
                                    fontWeight: 600,
                                    fontSize: '1rem',
                                    [theme.breakpoints.down('sm')]: {
                                        minWidth: '100px',
                                        height: '45px',
                                        fontSize: '0.9rem',
                                    },
                                }}
                            >
                                {item.label}
                            </Button>
                        </Grid>
                    ))}
                </Grid>

                <Typography variant="h6" gutterBottom sx={{ color: theme.palette.text.primary, mb: 2 }}>
                    Hoặc nhập số tiền khác:
                </Typography>
                <TextField
                    fullWidth
                    label="Số tiền tùy chỉnh (VNĐ)"
                    variant="outlined"
                    type="number" // Đảm bảo chỉ nhập số
                    value={amount}
                    onChange={(e) => {
                        // Đảm bảo chỉ số dương
                        const value = Math.max(0, parseInt(e.target.value) || 0);
                        setAmount(value);
                        setSelectedAmount(''); // Xóa lựa chọn từ nút khi nhập thủ công
                    }}
                    sx={{ mb: 3 }}
                    InputProps={{
                        startAdornment: <AttachMoneyOutlined sx={{ mr: 1 }} />,
                    }}
                />

                <TextField
                    fullWidth
                    label="Tên của bạn (Tùy chọn, sẽ hiển thị công khai nếu có danh sách)"
                    variant="outlined"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    sx={{ mb: 2 }}
                />

                <TextField
                    fullWidth
                    label="Lời nhắn (Tùy chọn)"
                    variant="outlined"
                    multiline
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    sx={{ mb: 3 }}
                ></TextField>

                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleVNPayPayment} // Đã đổi sang hàm xử lý VNPay
                    disabled={!(amount || selectedAmount)} // Nút bị vô hiệu hóa nếu chưa có số tiền
                    size="large"
                    endIcon={<FavoriteBorderOutlined />}
                    sx={{ py: 1.5, px: 4, fontWeight: 700 }}
                >
                    VNPAY {/* Đã đổi chữ thành VNPAY */}
                </Button>

                {/* Hiển thị kết quả thanh toán */}
                {paymentResult.show && (
                    <Box sx={{ mt: 3 }}>
                        <Alert severity={paymentResult.isSuccess ? "success" : "error"}>
                            {paymentResult.message}
                        </Alert>
                    </Box>
                )}
            </Paper>
        </Box>
    );
};

export default DonatePage;

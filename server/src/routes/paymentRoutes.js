import express from 'express'; // Sử dụng import cho ES Modules
import * as paymentController from '../controllers/paymentController.js'; // Sử dụng import * as và thêm .js extension

const router = express.Router();

// Route để khởi tạo thanh toán VNPay (Frontend gọi đến)
router.post('/create_vnpay', paymentController.createVNPayPayment);
// Route để xử lý kết quả trả về từ VNPay (VNPay gọi đến server của bạn)
router.get('/vnpay_return', paymentController.vnpayReturn);

// Route để khởi tạo thanh toán MoMo (Frontend gọi đến)
router.post('/create_momo', paymentController.createMomoPayment);
// Route để xử lý kết quả trả về từ MoMo (MoMo gọi đến server của bạn)
router.get('/momo_return', paymentController.momoReturn);
// Endpoint nhận thông báo từ MoMo (server-to-server)
router.post('/momo_notify', paymentController.momoNotify);

export default router; // Sử dụng export default cho ES Modules

// server/src/routes/vnpayRoutes.js
const express = require('express');
const router = express.Router();
const vnpayController = require('../controllers/vnpayController');

// Route để tạo URL thanh toán VNPAY (Frontend sẽ POST đến đây)
router.post('/create_vnpay', vnpayController.createPaymentUrl);

// Route để VNPAY gọi về sau khi thanh toán xong (VNPAY sẽ GET đến đây)
router.get('/vnpay_return', vnpayController.vnpayReturn);

module.exports = router;
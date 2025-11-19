// server/src/controllers/vnpayController.js
const moment = require('moment');
const crypto = require('crypto');
const querystring = require('qs'); // Đảm bảo đã cài đặt qs: yarn add qs
const vnpayConfig = require('../config/vnpayConfig');

exports.createPaymentUrl = (req, res) => {
    try {
        process.env.TZ = 'Asia/Ho_Chi_Minh'; // Đảm bảo múi giờ phù hợp với VNPay

        const date = new Date();
        const createDate = moment(date).format('YYYYMMDDHHmmss');
        const orderId = moment(date).format('DDHHmmss'); // Mã giao dịch của bạn (có thể dùng orderId từ request body nếu có)
        const { amount, orderInfo, userId } = req.body; // Lấy amount và orderInfo từ frontend
        const ipAddr = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;

        const tmnCode = vnpayConfig.vnp_TmnCode;
        const secretKey = vnpayConfig.vnp_HashSecret;
        const vnpUrl = vnpayConfig.vnp_Url;
        const returnUrl = vnpayConfig.vnp_ReturnUrl;

        let vnp_Params = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = tmnCode;
        vnp_Params['vnp_Locale'] = 'vn'; // Ngôn ngữ hiển thị trên trang VNPay
        vnp_Params['vnp_CurrCode'] = 'VND'; // Đơn vị tiền tệ
        vnp_Params['vnp_TxnRef'] = orderId; // Mã tham chiếu của giao dịch tại hệ thống của bạn
        vnp_Params['vnp_OrderInfo'] = orderInfo || `Thanh toan don hang ${orderId}`;
        vnp_Params['vnp_OrderType'] = 'billpayment'; // Loại hình thanh toán
        vnp_Params['vnp_Amount'] = amount * 100; // Số tiền (VNPay yêu cầu * 100)
        vnp_Params['vnp_ReturnUrl'] = returnUrl;
        vnp_Params['vnp_IpAddr'] = ipAddr;
        vnp_Params['vnp_CreateDate'] = createDate;

        // Sắp xếp các tham số theo thứ tự A-Z
        vnp_Params = sortObject(vnp_Params);

        // Tạo chữ ký (Secure Hash)
        const signData = querystring.stringify(vnp_Params, { encode: false });
        const hmac = crypto.createHmac('sha512', secretKey);
        const vnp_SecureHash = hmac.update(signData).digest('hex');

        vnp_Params['vnp_SecureHash'] = vnp_SecureHash;
        const vnpUrlWithParams = vnpUrl + '?' + querystring.stringify(vnp_Params, { encode: false });

        res.status(200).json({ code: '00', message: 'success', data: vnpUrlWithParams });

    } catch (error) {
        console.error("Error creating VNPAY payment URL:", error);
        res.status(500).json({ code: '99', message: 'Lỗi server khi tạo URL thanh toán.', error: error.message });
    }
};

exports.vnpayReturn = (req, res) => {
    let vnp_Params = req.query;
    const secureHash = vnp_Params['vnp_SecureHash'];

    // Xóa các tham số không dùng để kiểm tra chữ ký
    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);
    const secretKey = vnpayConfig.vnp_HashSecret;

    const signData = querystring.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(signData).digest('hex');

    if (secureHash === signed) {
        // Chữ ký hợp lệ, kiểm tra kết quả giao dịch
        const responseCode = vnp_Params['vnp_ResponseCode'];
        const transactionStatus = vnp_Params['vnp_TransactionStatus'];
        const orderId = vnp_Params['vnp_TxnRef'];
        const amount = vnp_Params['vnp_Amount'] / 100; // Chia lại cho 100

        if (responseCode === '00' && transactionStatus === '00') {
            // Giao dịch thành công
            // TODO: Cập nhật trạng thái đơn hàng trong database của bạn tại đây
            // Ví dụ: updateOrderToSuccess(orderId, amount);

            // Chuyển hướng về frontend với các tham số kết quả
            const frontendSuccessUrl = `${vnpayConfig.vnp_ReturnUrl}?orderId=${orderId}&message=Giao%20dich%20thanh%20cong!&vnp_ResponseCode=00`;
            res.redirect(frontendSuccessUrl);
        } else {
            // Giao dịch thất bại hoặc lỗi khác từ VNPay
            // TODO: Cập nhật trạng thái đơn hàng trong database của bạn tại đây
            // Ví dụ: updateOrderToFailed(orderId);

            const frontendFailUrl = `${vnpayConfig.vnp_ReturnUrl}?orderId=${orderId}&message=Giao%20dich%20that%20bai.&vnp_ResponseCode=${responseCode}`;
            res.redirect(frontendFailUrl);
        }
    } else {
        // Chữ ký không hợp lệ, có thể là lỗi hoặc bị giả mạo
        const orderId = vnp_Params['vnp_TxnRef']; // Lấy lại orderId để trả về
        const frontendInvalidHashUrl = `${vnpayConfig.vnp_ReturnUrl}?orderId=${orderId}&message=Chu%20ky%20khong%20hop%20le!&vnp_ResponseCode=97`; // Mã 97 là lỗi chữ ký
        res.redirect(frontendInvalidHashUrl);
    }
};

// Hàm hỗ trợ sắp xếp object theo key A-Z
function sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}
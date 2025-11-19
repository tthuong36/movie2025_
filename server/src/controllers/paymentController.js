import crypto from 'crypto';
import querystring from 'qs';
import fetch from 'node-fetch';
import moment from 'moment';


const vnp_TmnCode = '4QQNRCYC';  
const vnp_SecretKey = 'IYL9BF3D4QTVL3OBIN6KXYVY8JF0LPDA'; 
const vnp_Url = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';


const vnp_CallbackUrl = 'http://localhost:5000/api/payment/vnpay_return';


const frontend_PaymentStatus_Url = 'http://localhost:3000/donatepage';
const frontend_ThankYou_Url = 'http://localhost:3000/thankyou'; 

const momo_PartnerCode = "YOUR_MOMO_PARTNER_CODE";
const momo_AccessKey = "YOUR_MOMO_ACCESS_KEY";
const momo_SecretKey = "YOUR_MOMO_SECRET_KEY";
const momo_api_payment = "https://test-payment.momo.vn/gw_payment/transactionProcessor";
const momo_returnUrl = "http://localhost:3000/api/payment/momo_return";
const momo_notifyUrl = "http://localhost:3000/api/payment/momo_notify";


// Hàm định dạng ngày tháng cho VNPay (YYYYMMDDHHmmss)
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

// Hàm tạo chữ ký MoMo (HMAC SHA256)
function getSignatureMoMo(rawData, secretKey) {
    const hmac = crypto.createHmac('sha256', secretKey);
    hmac.update(rawData);
    const signature = hmac.digest("hex");
    return signature;
}

// Hàm tạo yêu cầu thanh toán MoMo
function createMomoPaymentRequest(orderId, orderInfo, amount, returnUrl, notifyUrl, partnerCode, accessKey) {
    const requestType = "captureWallet";
    const extraData = "{}";

    const rawData = `partnerCode=${partnerCode}&accessKey=${accessKey}&requestId=${orderId}&amount=${amount}&orderId=${orderId}&orderInfo=${orderInfo}&returnUrl=${returnUrl}&notifyUrl=${notifyUrl}&extraData=${extraData}`;
    const signature = getSignatureMoMo(rawData, momo_SecretKey);

    return {
        partnerCode: partnerCode,
        accessKey: accessKey,
        requestId: orderId,
        amount: amount,
        orderId: orderId,
        orderInfo: orderInfo,
        returnUrl: returnUrl,
        notifyUrl: notifyUrl,
        extraData: extraData,
        requestType: requestType,
        signature: signature,
    };
}


// =======================================================
// CÁC HÀM XỬ LÝ API ENDPOINT (CONTROLLERS)
// =======================================================

// Xử lý yêu cầu tạo URL thanh toán VNPay từ Frontend
export const createVNPayPayment = (req, res) => {
    try {
        process.env.TZ = 'Asia/Ho_Chi_Minh'; 

        const date = new Date();
        const createDateFormatted = moment(date).format('YYYYMMDDHHmmss');
        const expireDateFormatted = moment(date).add(15, 'minutes').format('YYYYMMDDHHmmss'); 

        const orderId = req.body.orderId || moment(date).format('DDHHmmss'); 
        const { amount, orderInfo } = req.body; 
        const ipAddr = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;

        const tmnCode = vnp_TmnCode;
        const secretKey = vnp_SecretKey;
        const vnpUrl = vnp_Url;
        
        let vnp_Params = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = tmnCode;
        vnp_Params['vnp_Locale'] = 'vn'; 
        vnp_Params['vnp_CurrCode'] = 'VND'; 
        vnp_Params['vnp_TxnRef'] = orderId; 
        vnp_Params['vnp_OrderInfo'] = orderInfo || `Thanh toan don hang ${orderId}`;
        vnp_Params['vnp_OrderType'] = 'billpayment'; 
        vnp_Params['vnp_Amount'] = amount * 100;
        vnp_Params['vnp_ReturnUrl'] = vnp_CallbackUrl; // <-- SỬ DỤNG vnp_CallbackUrl Ở ĐÂY
        vnp_Params['vnp_IpAddr'] = ipAddr;
        vnp_Params['vnp_CreateDate'] = createDateFormatted;
        vnp_Params['vnp_ExpireDate'] = expireDateFormatted;

        const sortedKeys = Object.keys(vnp_Params).sort();
        let hashData = '';
        for (let i = 0; i < sortedKeys.length; i++) {
            const key = sortedKeys[i];
            const value = vnp_Params[key];
            if (value !== undefined && value !== null) {
                hashData += `${key}=${encodeURIComponent(value).replace(/%20/g, "+")}`;
                if (i < sortedKeys.length - 1) {
                    hashData += '&';
                }
            }
        }

        const hmac = crypto.createHmac('sha512', secretKey);
        const vnp_SecureHash = hmac.update(hashData).digest('hex');

        vnp_Params['vnp_SecureHash'] = vnp_SecureHash;

        const finalUrlParams = Object.keys(vnp_Params).sort().map(key => {
            const value = vnp_Params[key];
            if (value !== undefined && value !== null) {
                return `${key}=${encodeURIComponent(value).replace(/%20/g, "+")}`;
            }
            return '';
        }).filter(Boolean).join('&');

        const vnpUrlWithParams = vnpUrl + '?' + finalUrlParams;

        res.status(200).json({ code: '00', message: 'success', data: vnpUrlWithParams });

    } catch (error) {
        console.error("Error creating VNPAY payment URL:", error);
        res.status(500).json({ code: '99', message: 'Lỗi server khi tạo URL thanh toán.', error: error.message });
    }
};

// Xử lý kết quả trả về từ VNPay (sau khi người dùng hoàn tất thanh toán trên trang VNPay)
export const vnpayReturn = (req, res) => {
    let vnp_Params = req.query;
    const secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    const sortedKeys = Object.keys(vnp_Params).sort();
    let hashData = '';
    for (let i = 0; i < sortedKeys.length; i++) {
        const key = sortedKeys[i];
        const value = vnp_Params[key];
        if (value !== undefined && value !== null) {
            hashData += `${key}=${encodeURIComponent(value).replace(/%20/g, "+")}`;
            if (i < sortedKeys.length - 1) {
                hashData += '&';
            }
        }
    }

    const secretKey = vnp_SecretKey;
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(hashData).digest('hex');

    let redirectUrl; 

    if (secureHash === signed) {
        const responseCode = vnp_Params['vnp_ResponseCode'];
        const transactionStatus = vnp_Params['vnp_TransactionStatus'];
        const orderId = vnp_Params['vnp_TxnRef'];
        const amount = vnp_Params['vnp_Amount'] / 100;

        if (responseCode === '00' && transactionStatus === '00') {
            console.log(`VNPay transaction successful: Order ID ${orderId}, Amount ${amount}`);
            redirectUrl = frontend_ThankYou_Url; // <--- DÒNG ĐÃ SỬA: CHUYỂN HƯỚNG ĐẾN TRANG CẢM ƠN KHI THÀNH CÔNG
        } else {
            console.log(`VNPay transaction failed: Order ID ${orderId}, Response Code ${responseCode}`);
            redirectUrl = `${frontend_PaymentStatus_Url}?orderId=${orderId}&message=Giao%20dich%20that%20bai.&vnp_ResponseCode=${responseCode}`;
        }
    } else {
        console.warn(`VNPay return: Invalid signature for Order ID ${vnp_Params['vnp_TxnRef']}`);
        const orderId = vnp_Params['vnp_TxnRef'];
        redirectUrl = `${frontend_PaymentStatus_Url}?orderId=${orderId}&message=Chu%20ky%20khong%20hop%20le!&vnp_ResponseCode=97`;
    }
    res.redirect(redirectUrl); // Chuyển hướng đến Frontend
};

// ... Các hàm MoMo ở dưới (giữ nguyên hoặc chỉnh sửa nếu cần)
export const createMomoPayment = async (req, res) => { /* ... */ };
export const momoReturn = (req, res) => { /* ... */ };
export const momoNotify = (req, res) => { /* ... */ };

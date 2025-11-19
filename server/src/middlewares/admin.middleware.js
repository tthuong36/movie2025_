import jwt from 'jsonwebtoken';
import responseHandler from '../handlers/response.handler.js';
import userModel from '../models/user.model.js';

// Middleware kiểm tra quyền Admin
const adminGuard = async (req, res, next) => {
    // ⚠️ BƯỚC 1: Lấy thông tin user đã được gắn từ tokenMiddleware.auth
    // Giả định: tokenMiddleware.auth đã chạy và gắn req.user (chứa user ID)
    const userId = req.user?.id; 

    if (!userId) {
        // Nếu không có ID, nghĩa là token không hợp lệ hoặc bị thiếu.
        return responseHandler.unauthorize(res, "Truy cập bị từ chối: Vui lòng đăng nhập.");
    }
    
    try {
        // ⚠️ BƯỚC 2: Tìm người dùng trong DB và kiểm tra trường role
        const user = await userModel.findById(userId);

        if (!user) {
            return responseHandler.notfound(res, "Người dùng không tồn tại.");
        }

        // BƯỚC 3: Kiểm tra quyền hạn
        if (user.role !== 'admin') {
            // Nếu không phải admin, trả về lỗi 403 Forbidden
            return responseHandler.forbidden(res, "Truy cập bị cấm: Bạn không có quyền quản trị.");
        }

        // BƯỚC 4: Nếu là Admin, cho phép request tiếp tục
        next();
        
    } catch (error) {
        // Lỗi database hoặc server
        responseHandler.error(res, "Lỗi server khi kiểm tra quyền hạn.");
    }
};

export default { adminGuard };
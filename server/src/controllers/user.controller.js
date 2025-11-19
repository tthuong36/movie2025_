import userModel from "../models/user.model.js";
import jsonwebtoken from "jsonwebtoken";
import responseHandler from "../handlers/response.handler.js";

const getUsersAdmin = async (req, res) => {
    try {
        const users = await userModel.find().select("-password -salt -__v");

        responseHandler.ok(res, users);
    } catch (e) {
        console.error("LỖI SERVER (getUsersAdmin):", e);
        responseHandler.error(res);
    }
};

const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const userToDelete = await userModel.findById(userId);

        if (!userToDelete) {
            return responseHandler.notfound(res, "Người dùng không tồn tại.");
        }
        
        if (userToDelete.role === 'admin') {
            return responseHandler.forbidden(res, "Không được phép xóa tài khoản Quản trị viên khác.");
        }

        await userModel.deleteOne({ _id: userId });

        responseHandler.ok(res, { message: "Xóa người dùng thành công." });
    } catch (e) {
        console.error("LỖI SERVER (deleteUser):", e);
        responseHandler.error(res);
    }
};

const signup = async (req, res) => {
    try {
        const { username, password, displayName } = req.body;
        const checkUser = await userModel.findOne({ username });
        if (checkUser) return responseHandler.badrequest(res, "username already used");
        const user = new userModel();
        user.displayName = displayName;
        user.username = username;
        user.setPassword(password);
        await user.save();

        const token = jsonwebtoken.sign(
            { data: user.id },
            process.env.TOKEN_SECRET_KEY, 
            { expiresIn: "24h" }
        );

        const userDoc = { ...user._doc };
        delete userDoc.password;
        delete userDoc.salt;

        responseHandler.created(res, {
            token,
            user: userDoc
        });
    } catch (e) {
        console.error("LỖI SERVER (signup):", e);
        responseHandler.error(res);
    }
};

const signin = async (req, res) => {
    try {
        const { username, password } = req.body;

        // ✅ FIX: Thêm .trim() để làm sạch tên người dùng
        const cleanUsername = username.trim(); 

        // ===========================================
        // === DÒNG DEBUG ĐÃ ĐƯỢC THÊM VÀO ===
        console.log("SERVER ĐANG TÌM USERNAME:", `"${cleanUsername}"`); // Sử dụng cleanUsername
        // ===========================================

        const user = await userModel.findOne({ username: cleanUsername }).select("+password +salt id displayName role"); // Dùng cleanUsername

        if (!user) {
            // ===========================================
            // === DÒNG DEBUG ĐÃ ĐƯỢC THÊM VÀO ===
            console.log("KẾT QUẢ TÌM KIẾM: Không thấy user!");
            // ===========================================
            return responseHandler.badrequest(res, "User not exist");
        }

        if (!user.validPassword(password)) return responseHandler.badrequest(res, "Wrong password");

        const token = jsonwebtoken.sign(
            { data: user.id },
            process.env.TOKEN_SECRET_KEY, 
            { expiresIn: "24h" }
        );

        const userDoc = { ...user._doc };
        delete userDoc.password;
        delete userDoc.salt;

        responseHandler.ok(res, {
            token,
            user: userDoc
        });
    } catch (e) {
        console.error("LỖI SERVER (signin):", e);
        responseHandler.error(res);
    }
};

const updatePassword = async (req, res) => {
    try {
        const { password, newPassword } = req.body;
        const user = await userModel.findById(req.user.id).select("+password +salt id"); 

        if (!user) return responseHandler.unauthorize(res);
        if (!user.validPassword(password)) return responseHandler.badrequest(res, "Wrong password");

        user.setPassword(newPassword);
        await user.save();
        responseHandler.ok(res);
    } catch (e) {
        console.error("LỖI SERVER (updatePassword):", e);
        responseHandler.error(res);
    }
};

const getInfo = async (req, res) => {
    try {
        const user = await userModel.findById(req.user.id);
        if (!user) return responseHandler.notfound(res);
        responseHandler.ok(res, user);
    } catch (e) {
        console.error("LỖI SERVER (getInfo):", e);
        responseHandler.error(res);
    }
};

export default {
    signup,
    signin,
    getInfo,
    updatePassword,
    // BỔ SUNG HÀM ADMIN VÀO EXPORT
    getUsersAdmin,
    deleteUser
};
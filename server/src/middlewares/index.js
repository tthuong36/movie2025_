
import adminGuard from "./admin.middleware.js";
import tokenAuth from "./token.middleware.js";

// Xuất tất cả các middleware
export default {
    adminGuard,
    tokenAuth,
};
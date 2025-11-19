import privateClient from "../client/private.client";
import publicClient from "../client/public.client";

const videoApi = {
    // === API CÔNG KHAI (Public) ===
    
    // Tìm kiếm NỘI BỘ (Dùng publicClient)
    searchVideos: async (query) => {
        try {
            const response = await publicClient.get(`videos/search?q=${query}`);
            return { response };
        } catch (err) {
            return { err };
        }
    },

    // Lấy chi tiết phim NỘI BỘ (Dùng publicClient)
    getVideoDetail: async (videoId) => {
        try {
            const response = await publicClient.get(`videos/${videoId}`);
            return { response };
        } catch (err) {
            return { err };
        }
    },


    // === API QUẢN TRỊ (Admin) ===
    // (Dùng privateClient để gửi Token)

    // Lấy danh sách phim (Admin List)
    getVideos: async () => {
        try {
            const response = await privateClient.get('videos'); 
            return { response };
        } catch (err) {
            return { err };
        }
    },

    // Tạo Phim
    createVideo: async (data) => {
        try {
            const response = await privateClient.post('videos', data);
            return { response };
        } catch (err) {
            return { err };
        }
    },
    
    // Cập nhật Phim
    updateVideo: async (videoId, data) => {
        try {
            const response = await privateClient.put(`videos/${videoId}`, data);
            return { response };
        } catch (err) {
            return { err };
        }
    },

    // Xóa Phim
    deleteVideo: async (videoId) => {
        try {
            const response = await privateClient.delete(`videos/${videoId}`);
            return { response };
        } catch (err) {
            return { err };
        }
    }
};

export default videoApi;
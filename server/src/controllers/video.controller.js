import responseHandler from "../handlers/response.handler.js";
import Video from "../models/Video.js"; // Đảm bảo bạn đã tạo file Model/Video.js

// Hàm lấy danh sách Video (Cho Admin Panel)
const getVideos = async (req, res) => {
    try {
        const videos = await Video.find({});
        return responseHandler.ok(res, videos);
    } catch (e) {
        // BẮT BUỘC: In lỗi 500 ra terminal
        console.error("LỖI 500 (Admin getVideos):", e);
        responseHandler.error(res);
    }
};

// Hàm lấy chi tiết 1 Video
const getVideoDetail = async (req, res) => {
    try {
        const { videoId } = req.params;
        
        // SỬA LỖI: Tìm kiếm bằng trường TMDB ID (ví dụ: tmdbId/mediaId) 
        // chứ không phải bằng _id của MongoDB
        const video = await Video.findOne({ tmdbId: videoId }); 
        
        if (!video) {
            return responseHandler.notfound(res, "Không tìm thấy phim trong kho nội bộ.");
        }
        return responseHandler.ok(res, video);
    } catch (e) {
        console.error("LỖI 500 (getVideoDetail):", e);
        responseHandler.error(res);
    }
};

// Hàm tạo Video
const createVideo = async (req, res) => {
    try {
        // ĐỔI: Sử dụng 'title' và 'videoUrl' theo Model mới nhất
        const { title, description, category, tmdbId, imgUrl, videoUrl } = req.body;
        
        const newVideo = new Video({
            title, description, category, tmdbId, imgUrl, videoUrl
        });

        const savedVideo = await newVideo.save();
        return responseHandler.created(res, savedVideo);
    } catch (e) {
        console.error("LỖI 500 (createVideo):", e);
        responseHandler.error(res);
    }
};

// Hàm cập nhật Video
const updateVideo = async (req, res) => {
    try {
        const { videoId } = req.params;
        const updatedVideo = await Video.findByIdAndUpdate(
            videoId,
            { $set: req.body },
            { new: true }
        );
        if (!updatedVideo) {
            return responseHandler.notfound(res, "Không tìm thấy video để cập nhật.");
        }
        return responseHandler.ok(res, updatedVideo);
    } catch (e) {
        console.error("LỖI 500 (updateVideo):", e);
        responseHandler.error(res);
    }
};

// Hàm xóa Video
const deleteVideo = async (req, res) => {
    try {
        const { videoId } = req.params;
        const deletedVideo = await Video.findByIdAndDelete(videoId);
        if (!deletedVideo) {
            return responseHandler.notfound(res, "Không tìm thấy video để xóa.");
        }
        return responseHandler.ok(res, { message: "Video đã được xóa thành công." });
    } catch (e) {
        console.error("LỖI 500 (deleteVideo):", e);
        responseHandler.error(res);
    }
};

// Hàm tìm kiếm Video
const searchVideos = async (req, res) => {
    try {
        const keyword = req.query.q;
        const limit = parseInt(req.query.limit) || 20;

        if (!keyword || keyword.length < 2) {
            return responseHandler.badrequest(res, "Vui lòng nhập từ khóa tối thiểu 2 ký tự.");
        }

        const results = await Video.find(
            { $text: { $search: keyword } },
            { score: { $meta: 'textScore' } }
        )
        .sort({ score: { $meta: 'textScore' } })
        .limit(limit);

        return responseHandler.ok(res, {
            message: `Tìm thấy ${results.length} kết quả cho '${keyword}'`,
            data: results
        });
    } catch (e) {
        console.error("LỖI 500 (searchVideos):", e);
        responseHandler.error(res);
    }
};

export default {
    searchVideos,
    getVideos,
    getVideoDetail,
    createVideo,
    updateVideo,
    deleteVideo
};
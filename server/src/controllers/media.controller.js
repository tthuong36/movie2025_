import responseHandler from "../handlers/response.handler.js";
import tmdbApi from "../tmdb/tmdb.api.js";
import userModel from "../models/user.model.js";
import favoriteModel from "../models/favorite.model.js";
import reviewModel from "../models/review.model.js";
import tokenMiddlerware from "../middlewares/token.middleware.js";

// Hàm tiện ích: Suy luận mediaType từ đường dẫn gốc
const getMediaTypeFromBaseUrl = (req) => {
    // Trả về 'tv' nếu đường dẫn chứa /tv, mặc định là 'movie'
    if (req.baseUrl && req.baseUrl.includes('tv')) return 'tv';
    return 'movie'; 
};

const getList = async (req, res) => {
    try {
        const { page } = req.query;
        const { mediaType, mediaCategory } = req.params;
        
        // FIX TƯƠNG THÍCH: Kiểm tra nếu mediaType bị mất do xung đột Routing (req.params không có)
        const finalMediaType = mediaType || getMediaTypeFromBaseUrl(req);
        
        // KIỂM TRA CHỐT: Nếu cả hai tham số đều rỗng, trả về lỗi 404 để tránh lỗi Code 6
        if (!finalMediaType || !mediaCategory) {
            console.error("LỖI CẤU TRÚC CUỐI: mediaType hoặc mediaCategory bị rỗng.");
            return responseHandler.notfound(res, "Không tìm thấy đường dẫn hoặc tham số.");
        }

        const currentPage = page || 1; 
        
        const { response, err } = await tmdbApi.mediaList({ mediaType: finalMediaType, mediaCategory, page: currentPage });

        if (err) {
            console.error("LỖI 500 (Controller getList):", err); 
            return responseHandler.error(res);
        }
        return responseHandler.ok(res, response);
    } catch (e) {
        console.error("LỖI 500 (Controller getList - Catch):", e);
        responseHandler.error(res);
    }
};

const getGenres = async (req, res) => {
    try {
        // FIX: Suy luận mediaType từ đường dẫn gốc
        const mediaType = req.params.mediaType || getMediaTypeFromBaseUrl(req);

        const { response, err } = await tmdbApi.mediaGenres({ mediaType });

        if (err) {
            console.error("LỖI 500 (Controller getGenres):", err);
            return responseHandler.error(res);
        }
        return responseHandler.ok(res, response);
    } catch (e) {
        console.error("LỖI 500 (Controller getGenres - Catch):", e);
        responseHandler.error(res);
    }
};

const search = async (req, res) => {
    try {
        const { mediaType } = req.params; 
        const { query, page } = req.query;

        const currentPage = page || 1;

        const { response, err } = await tmdbApi.mediaSearch({
            query,
            page: currentPage,
            mediaType: mediaType === "people" ? "person" : mediaType
        });

        if (err) {
            console.error("LỖI 500 (Controller search):", err);
            return responseHandler.error(res);
        }
        responseHandler.ok(res, response);
    } catch (e) {
        console.error("LỖI 500 (Controller search - Catch):", e);
        responseHandler.error(res);
    }
};

const getDetail = async (req, res) => {
    try {
        const { mediaType, mediaId } = req.params;
        const params = { mediaType, mediaId };

        const { response: media, err: mediaErr } = await tmdbApi.mediaDetail(params);
        if (mediaErr) {
            console.error("LỖI 500 (Controller getDetail - mediaDetail):", mediaErr);
            return responseHandler.error(res);
        }

        const { response: credits, err: creditsErr } = await tmdbApi.mediaCredits(params);
        if (creditsErr) {
            console.error("LỖI 500 (Controller getDetail - mediaCredits):", creditsErr);
            return responseHandler.error(res);
        }
        media.credits = credits;

        const { response: videos, err: videosErr } = await tmdbApi.mediaVideos(params);
        if (videosErr) {
            console.error("LỖI 500 (Controller getDetail - mediaVideos):", videosErr);
            return responseHandler.error(res);
        }
        media.videos = videos;

        const { response: recommend, err: recommendErr } = await tmdbApi.mediaRecommend(params);
        if (recommendErr) {
            console.error("LỖI 500 (Controller getDetail - mediaRecommend):", recommendErr);
            return responseHandler.error(res);
        }
        media.recommend = recommend.results;

        const { response: images, err: imagesErr } = await tmdbApi.mediaImages(params);
        if (imagesErr) {
            console.error("LỖI 500 (Controller getDetail - mediaImages):", imagesErr);
            return responseHandler.error(res);
        }
        media.images = images;

        const tokenDecoded = tokenMiddlerware.tokenDecode(req);

        if (tokenDecoded) {
            const user = await userModel.findById(tokenDecoded.data);
            if (user) {
                const isFavorite = await favoriteModel.findOne({ user: user.id, mediaId });
                media.isFavorite = isFavorite !== null;
            }
        }

        media.reviews = await reviewModel.find({ mediaId }).populate("user").sort("-createdAt");

        responseHandler.ok(res, media);
    } catch (e) {
        console.error("LỖI 500 (Controller getDetail - Catch):", e);
        responseHandler.error(res);
    }
};

export default { getList, getGenres, search, getDetail };
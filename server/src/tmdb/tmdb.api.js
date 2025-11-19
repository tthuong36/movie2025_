import axiosClient from "../axios/axios.client.js";
import tmdbEndpoints from "./tmdb.endpoints.js";

const tmdbApi = {
    mediaList: async ({ mediaType, mediaCategory, page }) => {
        try {
            const response = await axiosClient.get(
                tmdbEndpoints.mediaList({ mediaType, mediaCategory, page })
            );
            return { response };
        } catch (err) {
            // Logic Bắt lỗi MẠNG và Lỗi API
            return {
                err: {
                    // Trả về 503 Service Unavailable nếu là lỗi mạng (không có response)
                    status: err.response?.status || 503, 
                    // Nếu là lỗi API (401, 404), lấy tin nhắn từ TMDB. Nếu là lỗi mạng, trả về mô tả cứng.
                    message: err.response?.data?.status_message || "Network/TMDB Connection Error.", 
                    code: err.response?.data?.status_code
                }
            };
        }
    },
    mediaDetail: async ({ mediaType, mediaId }) => {
        try {
            const response = await axiosClient.get(
                tmdbEndpoints.mediaDetail({ mediaType, mediaId })
            );
            return { response };
        } catch (err) {
            return {
                err: {
                    status: err.response?.status || 503, 
                    message: err.response?.data?.status_message || "Network/TMDB Connection Error.",
                    code: err.response?.data?.status_code
                }
            };
        }
    },
    mediaGenres: async ({ mediaType }) => {
        try {
            const response = await axiosClient.get(
                tmdbEndpoints.mediaGenres({ mediaType })
            );
            return { response };
        } catch (err) {
            return {
                err: {
                    status: err.response?.status || 503, 
                    message: err.response?.data?.status_message || "Network/TMDB Connection Error.",
                    code: err.response?.data?.status_code
                }
            };
        }
    },
    mediaCredits: async ({ mediaType, mediaId }) => {
        try {
            const response = await axiosClient.get(
                tmdbEndpoints.mediaCredits({ mediaType, mediaId })
            );
            return { response };
        } catch (err) {
            return {
                err: {
                    status: err.response?.status || 503, 
                    message: err.response?.data?.status_message || "Network/TMDB Connection Error.",
                    code: err.response?.data?.status_code
                }
            };
        }
    },
    mediaVideos: async ({ mediaType, mediaId }) => {
        try {
            const response = await axiosClient.get(
                tmdbEndpoints.mediaVideos({ mediaType, mediaId })
            );
            return { response };
        } catch (err) {
            return {
                err: {
                    status: err.response?.status || 503, 
                    message: err.response?.data?.status_message || "Network/TMDB Connection Error.",
                    code: err.response?.data?.status_code
                }
            };
        }
    },
    mediaImages: async ({ mediaType, mediaId }) => {
        try {
            const response = await axiosClient.get(
                tmdbEndpoints.mediaImages({ mediaType, mediaId })
            );
            return { response };
        } catch (err) {
            return {
                err: {
                    status: err.response?.status || 503, 
                    message: err.response?.data?.status_message || "Network/TMDB Connection Error.",
                    code: err.response?.data?.status_code
                }
            };
        }
    },
    mediaRecommend: async ({ mediaType, mediaId }) => {
        try {
            const response = await axiosClient.get(
                tmdbEndpoints.mediaRecommend({ mediaType, mediaId })
            );
            return { response };
        } catch (err) {
            return {
                err: {
                    status: err.response?.status || 503, 
                    message: err.response?.data?.status_message || "Network/TMDB Connection Error.",
                    code: err.response?.data?.status_code
                }
            };
        }
    },
    mediaSearch: async ({ mediaType, query, page }) => {
        try {
            const response = await axiosClient.get(
                tmdbEndpoints.mediaSearch({ mediaType, query, page })
            );
            return { response };
        } catch (err) {
            return {
                err: {
                    status: err.response?.status || 503, 
                    message: err.response?.data?.status_message || "Network/TMDB Connection Error.",
                    code: err.response?.data?.status_code
                }
            };
        }
    },
    personDetail: async ({ personId }) => {
        try {
            const response = await axiosClient.get(
                tmdbEndpoints.personDetail({ personId })
            );
            return { response };
        } catch (err) {
            return {
                err: {
                    status: err.response?.status || 503, 
                    message: err.response?.data?.status_message || "Network/TMDB Connection Error.",
                    code: err.response?.data?.status_code
                }
            };
        }
    },
    personMedias: async ({ personId }) => {
        try {
            const response = await axiosClient.get(
                tmdbEndpoints.personMedias({ personId })
            );
            return { response };
        } catch (err) {
            return {
                err: {
                    status: err.response?.status || 503, 
                    message: err.response?.data?.status_message || "Network/TMDB Connection Error.",
                    code: err.response?.data?.status_code
                }
            };
        }
    }
};

export default tmdbApi; 
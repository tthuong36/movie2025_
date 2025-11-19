import axios from "axios";

// Đã sửa: Để code sạch sẽ, dùng biến TMDB_KEY và BASE_URL như hằng số
const TMDB_KEY = "5128552c9ce86adc06116a7b87ecc97b"; 
const baseURL = "https://api.themoviedb.org/3/";

const axiosClient = axios.create({
    baseURL
});

axiosClient.interceptors.request.use(async (config) => {
    
    config.params = {
        ...config.params,
        api_key: TMDB_KEY // Sử dụng Key
    };
    return config;
}, (error) => {
    return Promise.reject(error);
});

// =============================================
// SỬA RESPONSE INTERCEPTOR ĐỂ TRẢ VỀ LỖI CHUẨN
// =============================================
axiosClient.interceptors.response.use((response) => {
    if (response && response.data) return response.data;
    return response;
}, (error) => {
    // Nếu có lỗi, chúng ta dùng Promise.reject(error) để ném ra đối tượng lỗi AXIOS chuẩn, 
    // thay vì chỉ ném ra dữ liệu thô (data)
    return Promise.reject(error); 
});

export default axiosClient;
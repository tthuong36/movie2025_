import axios from "axios";

// FE chỉ gọi backend proxy TMDB → KHÔNG dùng TMDB_KEY ở FE nữa
// Key nằm trong backend, an toàn và không bị lộ.

// ===============================
// CẤU HÌNH AXIOS CLIENT
// ===============================

const axiosClient = axios.create({
      baseURL: "/api/proxy/tmdb/"
});

// ===============================
// REQUEST INTERCEPTOR
// (Không thêm TMDB_KEY, backend đã xử lý)
// ===============================
axiosClient.interceptors.request.use(
  (config) => {
    // Không sửa params nữa, giữ nguyên
    return config;
  },
  (error) => Promise.reject(error)
);

// ===============================
// RESPONSE INTERCEPTOR
// ===============================
axiosClient.interceptors.response.use(
  (response) => {
    // backend trả dữ liệu thuần → FE chỉ lấy data
    if (response && response.data) return response.data;
    return response;
  },
  (error) => {
    // Trả lỗi theo axios chuẩn
    return Promise.reject(error);
  }
);

export default axiosClient;

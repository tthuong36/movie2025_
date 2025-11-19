import axios from "axios";
import queryString from "query-string";

const baseURL = "https://moonflix-api.vercel.app/api/v1";
const privateClient = axios.create({
    baseURL,
    paramsSerializer: {
        encode: params => queryString.stringify(params)
    }
});

privateClient.interceptors.request.use(async config => {
    
    const token = localStorage.getItem("token"); 
    
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    config.headers["Content-Type"] = "application/json";

    return config;
}, error => {
    return Promise.reject(error);
});

privateClient.interceptors.response.use((response) => {
    if (response && response.data) return response.data;
    return response;
}, (err) => {
    throw err.response.data;
});

export default privateClient;
import axios from "axios";
import queryString from "query-string";

const baseURL = "https://movie2025-me3hox7luz-tthuong36-projects.vercel.app/api/v1";

const privateClient = axios.create({
  baseURL,
  paramsSerializer: {
    encode: params => queryString.stringify(params)
  }
});

privateClient.interceptors.request.use(config => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  config.headers["Content-Type"] = "application/json";
  return config;
});

privateClient.interceptors.response.use(
  (response) => response.data,
  (err) => { throw err.response?.data || err; }
);

export default privateClient;

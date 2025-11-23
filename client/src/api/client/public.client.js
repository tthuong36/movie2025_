import axios from "axios";
import queryString from "query-string";

const baseURL = "https://movie2025-me3hox7luz-tthuong36-projects.vercel.app/api/v1";

const publicClient = axios.create({
  baseURL,
  paramsSerializer: {
    encode: params => queryString.stringify(params)
  }
});

publicClient.interceptors.request.use(config => {
  config.headers["Content-Type"] = "application/json";
  return config;
});

publicClient.interceptors.response.use(
  (response) => response.data,
  (err) => { throw err.response?.data || err; }
);

export default publicClient;

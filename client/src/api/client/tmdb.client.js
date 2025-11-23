import axios from "axios";

const tmdbClient = axios.create({
  baseURL: "https://movie2025-me3hox7luz-tthuong36-projects.vercel.app/api/proxy/tmdb/"
});

tmdbClient.interceptors.response.use(
  (response) => response.data,
  (err) => { throw err.response?.data || err; }
);

export default tmdbClient;

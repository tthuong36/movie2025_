import axios from "axios";

const tmdbClient = axios.create({
  baseURL: "https://movie2025.onrender.com/api/v1"
});

tmdbClient.interceptors.response.use(
  (response) => response.data,
  (err) => { throw err.response?.data || err; }
);

export default tmdbClient;

import express from "express";
import axios from "axios";

const router = express.Router();

const fetchTMDB = async (url, params = {}) => {
  return axios.get(url, {
    params: {
      api_key: process.env.TMDB_KEY,
      ...params
    }
  });
};

// =====================
// SEARCH
// =====================
router.get("/search/:mediaType", async (req, res) => {
  const { mediaType } = req.params;
  const { query, page } = req.query;

  try {
    const url = `https://api.themoviedb.org/3/search/${mediaType}`;
    const { data } = await fetchTMDB(url, { query, page });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================
// GENRES
// =====================
router.get("/genre/:mediaType/list", async (req, res) => {
  const { mediaType } = req.params;

  try {
    const url = `https://api.themoviedb.org/3/genre/${mediaType}/list`;
    const { data } = await fetchTMDB(url);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================
// DETAIL
// =====================
router.get("/:mediaType/:id/detail", async (req, res) => {
  const { mediaType, id } = req.params;

  try {
    const url = `https://api.themoviedb.org/3/${mediaType}/${id}`;
    const { data } = await fetchTMDB(url);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================
// CREDITS
// =====================
router.get("/:mediaType/:id/credits", async (req, res) => {
  const { mediaType, id } = req.params;

  try {
    const url = `https://api.themoviedb.org/3/${mediaType}/${id}/credits`;
    const { data } = await fetchTMDB(url);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================
// VIDEOS
// =====================
router.get("/:mediaType/:id/videos", async (req, res) => {
  const { mediaType, id } = req.params;

  try {
    const url = `https://api.themoviedb.org/3/${mediaType}/${id}/videos`;
    const { data } = await fetchTMDB(url);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================
// RECOMMENDATIONS
// =====================
router.get("/:mediaType/:id/recommendations", async (req, res) => {
  const { mediaType, id } = req.params;

  try {
    const url = `https://api.themoviedb.org/3/${mediaType}/${id}/recommendations`;
    const { data } = await fetchTMDB(url);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================
// LIST (POPULAR, TOP_RATED…)
// ĐẶT CUỐI CÙNG!!!
// =====================
router.get("/:mediaType/:mediaCategory", async (req, res) => {
  const { mediaType, mediaCategory } = req.params;
  const { page } = req.query;

  try {
    const url = `https://api.themoviedb.org/3/${mediaType}/${mediaCategory}`;
    const { data } = await fetchTMDB(url, { page });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

const tmdbConfigs = {
  mediaType: {
    movie: "movie",
    tv: "tv"
  },
  mediaCategory: {
    popular: "popular",
    top_rated: "top_rated",
    upcoming: "upcoming",
    now_playing: "now_playing"
  },
  backdropPath: (img) =>
    `https://image.tmdb.org/t/p/original${img}`,
  posterPath: (img) =>
    `https://image.tmdb.org/t/p/w500${img}`
};

export default tmdbConfigs;

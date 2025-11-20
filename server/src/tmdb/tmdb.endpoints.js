import tmdbConfig from "./tmdb.config.js";

const tmdbEndpoints = {
  mediaList: ({ mediaType, mediaCategory, page }) =>
    tmdbConfig.getUrl(`media/${mediaType}/${mediaCategory}`, { page }),

  mediaDetail: ({ mediaType, mediaId }) =>
    tmdbConfig.getUrl(`media/detail/${mediaId}`, { mediaType }),

  mediaGenres: ({ mediaType }) =>
    tmdbConfig.getUrl(`media/genres/${mediaType}`),

  mediaCredits: ({ mediaType, mediaId }) =>
    tmdbConfig.getUrl(`media/${mediaType}/${mediaId}/credits`),

  mediaVideos: ({ mediaType, mediaId }) =>
    tmdbConfig.getUrl(`media/${mediaType}/${mediaId}/videos`),

  mediaImages: ({ mediaType, mediaId }) =>
    tmdbConfig.getUrl(`media/${mediaType}/${mediaId}/images`),

  mediaRecommend: ({ mediaType, mediaId }) =>
    tmdbConfig.getUrl(`media/${mediaType}/${mediaId}/recommend`),

  mediaSearch: ({ mediaType, query, page }) =>
    tmdbConfig.getUrl(`media/search`, { mediaType, query, page })
};

export default tmdbEndpoints;

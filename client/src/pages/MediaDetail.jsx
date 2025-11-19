import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PeopleIcon from "@mui/icons-material/People"; 

import { LoadingButton } from "@mui/lab";
import { Box, Button, Chip, Divider, Stack, Typography, useTheme } from "@mui/material"; 
import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

// API NỘI BỘ (Đã tạo)
import videoApi from "../api/modules/video.api"; 

// API TMDB (Giữ nguyên)
import mediaApi from "../api/modules/media.api"; 
import favoriteApi from "../api/modules/favorite.api";

// ... (Các imports khác giữ nguyên) ...
import CircularRate from "../components/common/CircularRate";
import Container from "../components/common/Container";
import ImageHeader from "../components/common/ImageHeader";
import WatchPartyModal from "../components/common/WatchPartyModal"; 
import uiConfigs from "../configs/ui.configs";
import tmdbConfigs from "../api/configs/tmdb.configs";
import { setGlobalLoading } from "../redux/features/globalLoadingSlice";
import { setAuthModalOpen } from "../redux/features/authModalSlice";
import { addFavorite, removeFavorite } from "../redux/features/userSlice";
import CastSlide from "../components/common/CastSlide";
import MediaVideosSlide from "../components/common/MediaVideosSlide";
import BackdropSlide from "../components/common/BackdropSlide";
import PosterSlide from "../components/common/PosterSlide";
import RecommendSlide from "../components/common/RecommendSlide";
import MediaSlide from "../components/common/MediaSlide";
import MediaReview from "../components/common/MediaReview";

const MediaDetail = () => {
    const { mediaType, mediaId } = useParams();
    const { user, listFavorites } = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const theme = useTheme(); 
    
    // --- STATE ---
    const [media, setMedia] = useState(null); 
    const [localVideo, setLocalVideo] = useState(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [onRequest, setOnRequest] = useState(false);
    const [genres, setGenres] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // SỬA: State cho Modal, lưu trữ linh hoạt
    const [modalData, setModalData] = useState({ 
        id: null, 
        title: null, 
        videoUrl: null, 
        isLocal: false 
    });
    
    const localPlayerRef = useRef(null); 
    const trailerRef = useRef(null); 

    // --- LOGIC TẢI DỮ LIỆU ---
    useEffect(() => {
        window.scrollTo(0, 0);
        const getMedia = async () => {
            dispatch(setGlobalLoading(true));
            setLocalVideo(null);
            
            try {
                const { response: tmdbResponse, err: tmdbErr } = await mediaApi.getDetail({ mediaType, mediaId });
                if (tmdbResponse) {
                    setMedia(tmdbResponse);
                    setIsFavorite(tmdbResponse.isFavorite);
                    setGenres(tmdbResponse.genres.splice(0, 2));
                } else if (tmdbErr) {
                    toast.error(tmdbErr.message);
                }
            } catch (error) {
                toast.error(error.message);
            }

            try {
                const { response: localResponse, err: localErr } = await videoApi.getVideoDetail(mediaId);
                if (localResponse) {
                    setLocalVideo(localResponse); 
                }
            } catch (error) {
                console.warn("Không tìm thấy phim trong kho nội bộ (Bình thường).");
                setLocalVideo(null);
            }
            
            dispatch(setGlobalLoading(false));
        };
        
        getMedia();
    }, [mediaType, mediaId, dispatch]);

    // ... (Các hàm onFavoriteClick, onRemoveFavorite giữ nguyên) ...
    const onFavoriteClick = async () => { /* ... */ };
    const onRemoveFavorite = async () => { /* ... */ };


    // --- SỬA: LOGIC NÚT BẤM WATCH PARTY (Dùng Trailer làm Fallback) ---
    const handleWatchPartyClick = () => {
        if (!media) return;
        if (!user) return dispatch(setAuthModalOpen(true));
        
        // 1. Ưu tiên video nội bộ
        if (localVideo) {
            setModalData({ 
                id: localVideo.id, 
                title: localVideo.title, 
                videoUrl: localVideo.videoUrl, // URL .mp4 nội bộ
                isLocal: true 
            });
            setIsModalOpen(true);
        } 
        // 2. Fallback: Dùng Trailer của TMDB
        else if (media.videos && media.videos.results.length > 0) {
            const trailer = media.videos.results[0];
            const trailerUrl = tmdbConfigs.youtubePath(trailer.key); // Lấy URL YouTube
            
            setModalData({ 
                id: media.id, // Dùng TMDB ID
                title: `${media.title || media.name} (Trailer)`,
                videoUrl: trailerUrl, // URL YouTube
                isLocal: false 
            });
            setIsModalOpen(true);
            toast.warn("Sử dụng trailer để test (chức năng đồng bộ có thể không hoạt động).");
        } 
        // 3. Nếu không có cả hai
        else {
            toast.error("Không có video nào (cả nội bộ và trailer) để xem chung.");
            return;
        }
    };

    return (
        media ? (
            <>
                {/* ... (Phần Info, Poster, Title, Genres, Overview...) ... */}
                <ImageHeader imgPath={tmdbConfigs.backdropPath(media.backdrop_path || media.poster_path)} />
                <Box sx={{
                    color: "primary.contrastText",
                    ...uiConfigs.style.mainContent
                }}>
                    <Box sx={{
                        marginTop: { xs: "-10rem", md: "-15rem", lg: "-20rem" }
                    }}>
                        <Box sx={{
                            display: "flex",
                            flexDirection: { md: "row", xs: "column" }
                        }}>
                            
                            <Box sx={{
                                width: { xs: "70%", sm: "50%", md: "40%" },
                                margin: { xs: "0 auto 2rem", md: "0 2rem 0 0" }
                            }}>
                                <Box sx={{
                                    paddingTop: "140%",
                                    ...uiConfigs.style.backgroundImage(tmdbConfigs.posterPath(media.poster_path || media.backdrop_path))
                                }} />
                            </Box>

                            <Box sx={{
                                width: { xs: "100%", md: "60%" },
                                color: "text.primary"
                            }}>
                                <Stack spacing={5}>
                                    <Typography
                                        variant="h4"
                                        fontSize={{ xs: "2rem", md: "2rem", lg: "4rem" }}
                                        fontWeight="700"
                                        sx={{ ...uiConfigs.style.typoLines(2, "left") }}
                                    >
                                        {`${media.title || media.name} ${mediaType === tmdbConfigs.mediaType.movie ? media.release_date.split("-")[0] : media.first_air_date.split("-")[0]}`}
                                    </Typography>

                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <CircularRate value={media.vote_average} />
                                        <Divider orientation="vertical" />
                                        {genres.map((genre, index) => (
                                            <Chip
                                                label={genre.name}
                                                variant="filled"
                                                color="primary"
                                                key={index}
                                            />
                                        ))}
                                    </Stack>

                                    <Typography
                                        variant="body1"
                                        sx={{ ...uiConfigs.style.typoLines(5) }}
                                    >
                                        {media.overview}
                                    </Typography>

                                    {/* === BUTTONS (ĐÃ SỬA LOGIC) === */}
                                    <Stack direction="row" spacing={2}> 
                                        <LoadingButton
                                            variant="text"
                                            sx={{
                                                width: "max-content",
                                                "& .MuiButon-starIcon": { marginRight: "0" }
                                            }}
                                            size="large"
                                            startIcon={isFavorite ? <FavoriteIcon /> : <FavoriteBorderOutlinedIcon />}
                                            loadingPosition="start"
                                            loading={onRequest}
                                            onClick={onFavoriteClick}
                                        />
                                        
                                        <Button
                                            variant="contained"
                                            sx={{ width: "max-content" }}
                                            size="large"
                                            startIcon={<PlayArrowIcon />}
                                            onClick={() => {
                                                if (localVideo) {
                                                    localPlayerRef.current.scrollIntoView({ behavior: 'smooth' });
                                                } else {
                                                    trailerRef.current.scrollIntoView({ behavior: 'smooth' });
                                                }
                                            }}
                                        >
                                            {localVideo ? "Watch Movie" : "Watch Trailer"}
                                        </Button>

                                        {/* SỬA: Nút Watch Party (Luôn bật) */}
                                        <Button
                                            variant="outlined" 
                                            sx={{ 
                                                width: "max-content", 
                                                borderColor: theme.palette.primary.contrastText,
                                                color: theme.palette.primary.contrastText,
                                                '&:hover': {
                                                    borderColor: theme.palette.primary.main,
                                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                }
                                            }} 
                                            size="large"
                                            startIcon={<PeopleIcon />}
                                            onClick={handleWatchPartyClick}
                                            // ĐÃ BỎ: disabled={!localVideo} 
                                        >
                                            Watch Party
                                        </Button>
                                    </Stack>

                                    <Container header="Cast">
                                        <CastSlide casts={media.credits.cast} />
                                    </Container>
                                </Stack>
                            </Box>
                        </Box>
                    </Box>

                    {/* === TRÌNH PHÁT VIDEO (ĐÃ SỬA LOGIC) === */}

                    {localVideo && (
                        <div ref={localPlayerRef} style={{ paddingTop: "2rem" }}>
                            <Container header="Movie Player">
                                <video 
                                    src={localVideo.videoUrl} 
                                    controls 
                                    style={{ width: '100%', borderRadius: '8px' }}
                                />
                            </Container>
                        </div>
                    )}
                    
                    <div ref={trailerRef} style={{ paddingTop: "2rem" }}>
                        <Container header="Trailers">
                            <MediaVideosSlide videos={[...media.videos.results].splice(0, 5)} />
                        </Container>
                    </div>

                    {/* ... (Backdrops, Posters, Reviews, Recommend...) ... */}
                    {media.images.backdrops.length > 0 && (
                        <Container header="backdrops">
                            <BackdropSlide backdrops={media.images.backdrops} />
                        </Container>
                    )}
                    {media.images.posters.length > 0 && (
                        <Container header="posters">
                            <PosterSlide posters={media.images.posters} />
                        </Container>
                    )}
                    <MediaReview reviews={media.reviews} media={media} mediaType={mediaType} />
                    <Container header="you may also like">
                        {media.recommend.length > 0 && (
                            <RecommendSlide medias={media.recommend} mediaType={mediaType} />
                        )}
                        {media.recommend.length === 0 && (
                            <MediaSlide
                                mediaType={mediaType}
                                mediaCategory={tmdbConfigs.mediaCategory.top_rated}
                            />
                        )}
                    </Container>
                </Box>

                {/* SỬA: Modal Watch Party (Render dựa trên state) */}
                {isModalOpen && (
                    <WatchPartyModal
                        mediaId={modalData.id} 
                        mediaTitle={modalData.title}
                        videoUrl={modalData.videoUrl} // Truyền URL (local hoặc trailer)
                        isLocal={modalData.isLocal} // Truyền loại video
                        onClose={() => setIsModalOpen(false)}
                    />
                )}
            </>
        ) : null
    );
};

export default MediaDetail;
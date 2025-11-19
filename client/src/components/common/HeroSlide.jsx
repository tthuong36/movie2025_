import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PeopleIcon from "@mui/icons-material/People";
import { Box, Button, Chip, Divider, Stack, Typography, useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { toast } from "react-toastify";

// SỬA LỖI: Import modules trực tiếp từ 'swiper' thay vì 'swiper/modules'
import { Autoplay, Navigation, Pagination } from "swiper";

import { setGlobalLoading } from "../../redux/features/globalLoadingSlice";
import { routesGen } from "../../routes/routes";

import uiConfigs from "../../configs/ui.configs";

import CircularRate from "./CircularRate";
import WatchPartyModal from "./WatchPartyModal"; 

import tmdbConfigs from "../../api/configs/tmdb.configs";
import genreApi from "../../api/modules/genre.api";
import mediaApi from "../../api/modules/media.api";

const HeroSlide = ({ mediaType, mediaCategory }) => {
    const theme = useTheme();
    const dispatch = useDispatch();

    const [movies, setMovies] = useState([]);
    const [genres, setGenres] = useState([]);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState({}); 

    const handleWatchPartyClick = (mediaId, mediaTitle) => {
        setModalData({ id: mediaId, title: mediaTitle });
        setIsModalOpen(true);
    };

    useEffect(() => {
        const getMedias = async () => {
            // SỬA LỖI: Thêm try...catch
            try {
                const { response, err } = await mediaApi.getList({
                    mediaType,
                    mediaCategory,
                    page: 1
                });

                if (response) setMovies(response.results);
                if (err) toast.error(err.message);
            } catch (error) {
                toast.error(error.message); 
            }
            dispatch(setGlobalLoading(false));
        };

        const getGenres = async () => {
            dispatch(setGlobalLoading(true));
            // SỬA LỖI: Thêm try...catch
            try {
                const { response, err } = await genreApi.getList({ mediaType });

                if (response) {
                    setGenres(response.genres);
                    getMedias();
                }
                if (err) {
                    toast.error(err.message);
                    setGlobalLoading(false);
                }
            } catch (error) {
                toast.error(error.message); 
                setGlobalLoading(false);
            }
        };

        getGenres();
    }, [mediaType, mediaCategory, dispatch]);

    if (movies.length === 0) {
        return <Box sx={{ height: "60vh", position: "relative" }} />;
    }

    return (
        <Box sx={{
            position: "relative",
            color: "primary.contrastText",
            "&::before": {
                content: '""',
                width: "100%",
                height: "30%",
                position: "absolute",
                bottom: 0,
                left: 0,
                zIndex: 2,
                pointerEvents: "none",
                ...uiConfigs.style.gradientBgImage[theme.palette.mode]
            }
        }}>
            <Swiper
                grabCursor={true}
                loop={true}
                // SỬA LỖI: Đăng ký các module
                modules={[Autoplay, Navigation, Pagination]} 
                style={{ width: "100%", height: "max-content" }}
                autoplay={{
                    delay: 3000,
                    disableOnInteraction: false
                }}
            >
                {movies.map((movie, index) => (
                    <SwiperSlide key={index}>
                        <Box sx={{
                            paddingTop: {
                                xs: "130%",
                                sm: "80%",
                                md: "60%",
                                lg: "45%"
                            },
                            backgroundPosition: "top",
                            backgroundSize: "cover",
                            backgroundImage: `url(${tmdbConfigs.backdropPath(movie.backdrop_path || movie.poster_path)})`
                        }} />
                        <Box sx={{
                            width: "100%",
                            height: "100%",
                            position: "absolute",
                            top: 0,
                            left: 0,
                            ...uiConfigs.style.horizontalGradientBgImage[theme.palette.mode]
                        }} />
                        <Box sx={{
                            width: "100%",
                            height: "100%",
                            position: "absolute",
                            top: 0,
                            left: 0,
                            paddingX: { sm: "10px", md: "5rem", lg: "10rem" }
                        }}>
                            <Box sx={{
                                height: "100%",
                                display: "flex",
                                alignItems: "center",
                                paddingX: "30px",
                                color: "text.primary",
                                width: { sm: "unset", md: "30%", lg: "40%" }
                            }}>
                                <Stack spacing={4} direction="column">
                                    <Typography
                                        variant="h4"
                                        fontSize={{ xs: "2rem", md: "2rem", lg: "4rem" }}
                                        fontWeight="700"
                                        sx={{
                                            ...uiConfigs.style.typoLines(2, "left")
                                        }}
                                    >
                                        {movie.title || movie.name}
                                    </Typography>

                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <CircularRate value={movie.vote_average} />
                                        <Divider orientation="vertical" />
                                        {[...movie.genre_ids].splice(0, 2).map((genreId, index) => (
                                            <Chip
                                                variant="filled"
                                                color="primary"
                                                key={index}
                                                label={genres.find(e => e.id === genreId) && genres.find(e => e.id === genreId).name}
                                            />
                                        ))}
                                    </Stack>

                                    <Typography variant="body1" sx={{
                                        ...uiConfigs.style.typoLines(3)
                                    }}>
                                        {movie.overview}
                                    </Typography>

                                    <Stack direction="row" spacing={2}> 
                                        <Button
                                            variant="contained"
                                            size="large"
                                            startIcon={<PlayArrowIcon />}
                                            component={Link}
                                            to={routesGen.mediaDetail(mediaType, movie.id)}
                                            sx={{ width: "max-content" }}
                                        >
                                            watch now
                                        </Button>
                                        <Button
                                            variant="outlined" 
                                            size="large" 
                                            startIcon={<PeopleIcon />}
                                            onClick={() => handleWatchPartyClick(movie.id, movie.title || movie.name)}
                                            sx={{ width: "max-content", 
                                                borderColor: 'primary.contrastText',
                                                color: 'primary.contrastText',
                                                '&:hover': {
                                                    borderColor: 'primary.main',
                                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                }
                                            }} 
                                        >
                                            Watch Party
                                        </Button>
                                    </Stack>
                                </Stack>
                            </Box>
                        </Box>
                    </SwiperSlide>
                ))}
            </Swiper>
            {isModalOpen && (
                <WatchPartyModal
                    mediaId={modalData.id}
                    mediaTitle={modalData.title}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </Box>
    );
};

export default HeroSlide;

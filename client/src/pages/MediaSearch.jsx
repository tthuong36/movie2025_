import { LoadingButton } from "@mui/lab";
import { Box, Button, Stack, TextField, Toolbar } from "@mui/material";
import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import mediaApi from "../api/modules/media.api";
import MediaGrid from "../components/common/MediaGrid";
import uiConfigs from "../configs/ui.configs";

// THÊM: Imports cho Kho Phim Riêng
import videoApi from "../api/modules/video.api";
import Container from "../components/common/Container";

const mediaTypes = ["movie", "tv", "people"];
let timer;
const timeout = 500;

const MediaSearch = () => { 
    const [query, setQuery] = useState("");
    const [onSearch, setOnSearch] = useState(false);
    const [mediaType, setMediaType] = useState(mediaTypes[0]);
    const [page, setPage] = useState(1);

    // State cho kết quả TMDB (Giữ nguyên)
    const [medias, setMedias] = useState([]);
    
    // THÊM: State cho kết quả Kho Phim Riêng
    const [localMedias, setLocalMedias] = useState([]);

    // Hàm tìm kiếm TMDB (Giữ nguyên)
    const search = useCallback(
        async () => {
            setOnSearch(true);
            const { response, err } = await mediaApi.search({
                mediaType,
                query,
                page
            });
            setOnSearch(false);

            if (err) toast.error(err.message);
            if (response) {
                if (page > 1) setMedias(m => [...m, ...response.results]);
                else setMedias([...response.results]);
            }
        },
        [mediaType, query, page],
    );

    // useEffect cho tìm kiếm TMDB (Giữ nguyên)
    useEffect(() => {
        if (query.trim().length === 0) {
            setMedias([]);
            setLocalMedias([]); // SỬA: Reset cả kết quả nội bộ
            setPage(1);
        } else {
            // Chỉ gọi search (TMDB) khi mediaType != people
            if (mediaType !== "people") search();
        }
    }, [search, query, mediaType, page]); // Giữ nguyên dependencies

    // THÊM: useEffect riêng cho Tìm kiếm Kho Phim Riêng
    // (Chạy khi query hoặc mediaType thay đổi, không phụ thuộc vào 'page')
    useEffect(() => {
        const searchLocal = async () => {
            // Không tìm 'people' trong kho nội bộ
            if (mediaType === "people") {
                setLocalMedias([]);
                return;
            }
            
            try {
                const { response, err } = await videoApi.searchVideos(query);
                
                if (response && response.data) {
                    setLocalMedias(response.data); // Lưu kết quả nội bộ
                }
                if (err) {
                    setLocalMedias([]); // Xóa kết quả nếu có lỗi
                }
            } catch (error) {
                toast.error(error.message);
                setLocalMedias([]);
            }
        };

        if (query.trim().length > 0) {
            searchLocal();
        } else {
            setLocalMedias([]); // Xóa nếu query rỗng
        }
    }, [query, mediaType]); // Chỉ chạy khi query hoặc mediaType thay đổi

    // useEffect khi đổi Category (Giữ nguyên)
    useEffect(() => {
        setMedias([]);
        setLocalMedias([]); // SỬA: Reset cả kết quả nội bộ
        setPage(1);
    }, [mediaType]);

    const onCategoryChange = (selectedCategory) => setMediaType(selectedCategory);

    const onQueryChange = (e) => {
        const newQuery = e.target.value;
        clearTimeout(timer);

        timer = setTimeout(() => {
            setQuery(newQuery);
        }, timeout);
    };

    return (
        <>
            <Toolbar />
            <Box sx={{ ...uiConfigs.style.mainContent }}>
                <Stack spacing={2}>
                    <Stack
                        spacing={2}
                        direction="row"
                        justifyContent="center"
                        sx={{ width: "100%" }}
                    >
                        {mediaTypes.map((item, index) => (
                            <Button
                                size="large"
                                key={index}
                                variant={mediaType === item ? "contained" : "text"}
                                sx={{
                                    color: mediaType === item ? "primary.contrastText" : "text.primary"
                                }}
                                onClick={() => onCategoryChange(item)}
                            >
                                {item}
                            </Button>
                        ))}
                    </Stack>
                    <TextField
                        color="success"
                        placeholder="Search Gỗ Phim"
                        sx={{ width: "100%" }}
                        autoFocus
                        onChange={onQueryChange}
                    />

                    {/* THÊM: Hiển thị Kết quả Kho Phim Riêng */}
                    {localMedias.length > 0 && (
                        <Box sx={{ mb: 4 }}>
                            <Container header="Từ Kho Phim Của Bạn">
                                {/* Dùng lại MediaGrid, nhưng mediaType có thể cần điều chỉnh */}
                                <MediaGrid medias={localMedias} mediaType={mediaType === "tv" ? "tv" : "movie"} />
                            </Container>
                        </Box>
                    )}

                    {/* Kết quả TMDB (Đã đổi tên header) */}
                    <Container header="Kết quả từ TMDB">
                        <MediaGrid medias={medias} mediaType={mediaType} />
                    </Container>

                    {/* Nút Load More (Chỉ áp dụng cho TMDB) */}
                    {medias.length > 0 && (
                        <LoadingButton
                            loading={onSearch}
                            onClick={() => setPage(page + 1)}
                        >
                            load more
                        </LoadingButton>
                    )}
                </Stack>
            </Box>
        </>
    );
};

export default MediaSearch;
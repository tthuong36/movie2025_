import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Paper, Stack } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import videoApi from '../../api/modules/video.api'; 

const AdminVideoForm = () => {
    const { videoId } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        tmdbId: '', // Sửa: tmdbId
        imgUrl: '', // Sửa: imgUrl
        videoUrl: '', // Sửa: videoUrl
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (videoId) {
            const fetchVideoDetail = async () => {
                setLoading(true);
                const { response, err } = await videoApi.getVideoDetail(videoId); 
                setLoading(false);

                if (response) {
                    setFormData({
                        ...response,
                        category: response.category ? response.category.join(', ') : ''
                    });
                } else if (err) {
                    toast.error(err.message);
                }
            };
            fetchVideoDetail();
        }
    }, [videoId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const dataToSend = {
            ...formData,
            category: formData.category.split(',').map(c => c.trim()).filter(c => c.length > 0) 
        };

        let finalResponse, error;

        if (videoId) {
            const { response, err } = await videoApi.updateVideo(videoId, dataToSend);
            finalResponse = response;
            error = err;
        } else {
            const { response, err } = await videoApi.createVideo(dataToSend);
            finalResponse = response;
            error = err;
        }

        setLoading(false);

        if (finalResponse) {
            toast.success(videoId ? "Cập nhật phim thành công!" : "Thêm phim mới thành công!");
            navigate('/admin'); 
        } else if (error) {
            toast.error(error.message);
        }
    };

    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h4" sx={{ mb: 4 }}>
                {videoId ? "Sửa Phim" : "Thêm Phim Mới"}
            </Typography>
            <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
                <Stack spacing={3}>
                    <TextField
                        required
                        fullWidth
                        label="Tên Phim (title)"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                    />
                    <TextField
                        required
                        fullWidth
                        label="URL File Phim Chính (videoUrl)"
                        name="videoUrl"
                        value={formData.videoUrl}
                        onChange={handleChange}
                    />
                    <TextField
                        required
                        fullWidth
                        multiline
                        rows={4}
                        label="Mô tả (description)"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                    />
                    <TextField
                        required
                        fullWidth
                        label="Thể loại (category)"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        helperText="Nhập các thể loại, phân cách nhau bằng dấu phẩy"
                    />
                    <TextField
                        required
                        fullWidth
                        label="TMDB ID"
                        name="tmdbId"
                        value={formData.tmdbId}
                        onChange={handleChange}
                    />
                    <TextField
                        fullWidth
                        label="Poster URL (imgUrl)"
                        name="imgUrl"
                        value={formData.imgUrl}
                        onChange={handleChange}
                    />
                    
                    <Button 
                        type="submit" 
                        variant="contained" 
                        color="primary"
                        startIcon={<SaveIcon />}
                        disabled={loading}
                    >
                        {loading ? "Đang xử lý..." : "Lưu Thay Đổi"}
                    </Button>
                </Stack>
            </Paper>
        </Box>
    );
};

export default AdminVideoForm;
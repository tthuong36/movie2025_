import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, CircularProgress, Stack } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import videoApi from '../../api/modules/video.api';

const AdminVideoList = () => {
    const navigate = useNavigate();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Hàm gọi API Lấy danh sách phim
    const fetchVideos = async () => {
        setLoading(true);
        const { response, err } = await videoApi.getVideos(); 

        if (response) {
            setVideos(response.data || response); 
        } else if (err) {
            toast.error(err.message || "Không thể tải danh sách phim.");
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchVideos();
    }, []);

    // Hàm XÓA phim
    const handleDelete = async (videoId) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa phim này không?")) return;
        
        const { response, err } = await videoApi.deleteVideo(videoId); 

        if (response) {
            toast.success("Xóa phim thành công!");
            fetchVideos(); // Tải lại danh sách sau khi xóa
        } else if (err) {
            toast.error(err.message);
        }
    };

    return (
        <Box sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">Quản Lý Kho Phim Nội Bộ</Typography>
                <Button 
                    variant="contained" 
                    color="success" 
                    startIcon={<AddIcon />} 
                    component={Link} 
                    to="/admin/add"
                >
                    Thêm Phim Mới
                </Button>
            </Box>

            <TableContainer component={Paper}>
                {loading ? (
                    <Stack sx={{ p: 3 }} alignItems="center">
                        <CircularProgress />
                        <Typography variant="body1" sx={{ mt: 2 }}>Đang tải danh sách phim...</Typography>
                    </Stack>
                ) : (
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID Phim</TableCell>
                                <TableCell>Tên Phim</TableCell>
                                <TableCell>Thể Loại</TableCell>
                                <TableCell>URL Video</TableCell>
                                <TableCell align="right">Hành Động</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {videos.length > 0 ? (
                                videos.map((video) => (
                                    <TableRow key={video.id}>
                                        <TableCell>{video.id ? video.id.substring(0, 6) : 'N/A'}...</TableCell>
                                        <TableCell>{video.title}</TableCell>
                                        <TableCell>{video.category ? video.category.join(', ') : 'N/A'}</TableCell>
                                        <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{video.videoUrl}</TableCell>
                                        <TableCell align="right">
                                            <IconButton 
                                                color="primary" 
                                                component={Link} 
                                                to={`/admin/edit/${video.id}`}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton color="error" onClick={() => handleDelete(video.id)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">Không có phim nào trong kho.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                )}
            </TableContainer>
        </Box>
    );
};

export default AdminVideoList;
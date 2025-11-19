import React from 'react';
import { Divider, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography, Box } from '@mui/material';
import { People, VideoLibrary, RateReview, Settings, Dashboard } from '@mui/icons-material';
import { Link } from 'react-router-dom'; 

// Dữ liệu menu Admin
const adminRoutes = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/admin' },
    { text: 'Quản lý Người dùng', icon: <People />, path: '/admin/users' },
    { text: 'Quản lý Video', icon: <VideoLibrary />, path: '/admin/videos' },
    { text: 'Kiểm duyệt Reviews', icon: <RateReview />, path: '/admin/reviews' },
];

const AdminSidebar = ({ drawerWidth }) => {
    return (
        <Drawer
            variant="permanent"
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                [`& .MuiDrawer-paper`]: {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                    bgcolor: '#191919', 
                    color: 'white',
                    borderRight: '1px solid #333'
                },
            }}
        >
            <Toolbar>
                <Typography variant="h6" color="primary.main" noWrap>
                    Bảng Điều Khiển
                </Typography>
            </Toolbar>
            <Divider sx={{ bgcolor: '#333' }} />
            <List>
                {adminRoutes.map((item) => (
                    <ListItem key={item.text} disablePadding>
                        <ListItemButton component={Link} to={item.path}>
                            <ListItemIcon sx={{ color: 'primary.main' }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            <Divider sx={{ bgcolor: '#333' }} />
            <Box sx={{ flexGrow: 1 }} />
            <List>
                <ListItem disablePadding>
                    <ListItemButton component={Link} to="/admin/settings">
                        <ListItemIcon sx={{ color: 'white' }}>
                            <Settings />
                        </ListItemIcon>
                        <ListItemText primary="Cài đặt" />
                    </ListItemButton>
                </ListItem>
            </List>
        </Drawer>
    );
};

export default AdminSidebar;
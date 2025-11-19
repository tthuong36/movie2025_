import { ThemeProvider } from "@mui/material/styles";
import { useSelector } from "react-redux";
import themeConfigs from "./configs/theme.configs";
import { ToastContainer } from "react-toastify";
import CssBaseline from "@mui/material/CssBaseline";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import routes from "./routes/routes";
import PageWrapper from "./components/common/PageWrapper";

// ✅ BỔ SUNG IMPORTS CHO ADMIN PANEL VÀ LAYOUT
import AdminLayout from "./components/layout/AdminLayout"; // Khung sườn Admin
import UserManagement from "./pages/UserManagement"; 
import AdminDashboard from "./pages/AdminDashboard"; 
import VideoManagement from "./pages/VideoManagement";

import "react-toastify/dist/ReactToastify.css";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import DonatePage from './components/DonatePage';
import ThankYouPage from './pages/ThankYouPage'; 
import WatchPartyPage from "./components/WatchPartyPage";
const App = () => {
  const { themeMode } = useSelector((state) => state.themeMode);

  return (
    <ThemeProvider theme={themeConfigs.custom({ mode: themeMode })}>
      {/* config toastify */}
      <ToastContainer
        position="bottom-left"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        pauseOnHover
        theme={themeMode}
      />
      {/* mui reset css */}
      <CssBaseline />

      {/* app routes */}
      <BrowserRouter>
        <Routes>
            {/* ======================================================= */}
            {/* ✅ ADMIN ROUTES (ĐÃ BỔ SUNG) */}
            {/* ======================================================= */}
            <Route path="/admin" element={<AdminLayout />}>
                {/* Route mặc định cho /admin (Dashboard) */}
                <Route index element={<AdminDashboard />} /> 
                
                {/* Route: /admin/users -> Quản lý người dùng */}
                <Route path="users" element={<UserManagement />} />
                
                {/* Route: /admin/videos -> Quản lý video */}
                <Route path="videos" element={<VideoManagement />} /> 

                {/* Các route con khác như reviews, settings có thể được thêm vào tương tự */}
            </Route>

          {/* Route cho trang cảm ơn */}
          <Route path="/thankyou" element={<ThankYouPage />} />

          {/* ROUTE CHO WATCH PARTY - Đặt ngoài MainLayout */}
          <Route path="/watch-party/:roomID" element={<WatchPartyPage />} /> 

          {/* Route cho layout chính và các route con của nó */}
          <Route path="/" element={<MainLayout />}>
            {routes.map((route, index) => (
              route.index ? (
                <Route
                  index
                  key={index}
                  element={route.state ? (
                    <PageWrapper state={route.state}>{route.element}</PageWrapper>
                  ) : route.element}
                />
              ) : (
                <Route
                  path={route.path}
                  key={index}
                  element={route.state ? (
                    <PageWrapper state={route.state}>{route.element}</PageWrapper>
                  ) : route.element}
                />
              )
            ))}
          </Route>
        </Routes>
      </BrowserRouter>
      {/* app routes */}
    </ThemeProvider>
  );
};

export default App;
import React from 'react';
import HomePage from "../pages/HomePage";
import PersonDetail from "../pages/PersonDetail";
import FavoriteList from "../pages/FavoriteList";
import MediaDetail from "../pages/MediaDetail";
import MediaList from "../pages/MediaList";
import MediaSearch from "../pages/MediaSearch";
import PasswordUpdate from "../pages/PasswordUpdate";
import ReviewList from "../pages/ReviewList";
import ProtectedPage from "../components/common/ProtectedPage";
import DonatePage from "../components/DonatePage"; 

// THÊM: Imports cho Admin Panel
import AdminGuard from "../components/admin/AdminGuard";
import AdminVideoList from "../components/admin/AdminVideoList";
import AdminVideoForm from "../components/admin/AdminVideoForm";

export const routesGen = {
  home: "/",
  mediaList: (type) => `/${type}`,
  mediaDetail: (type, id) => `/${type}/${id}`,
  mediaSearch: "/search",
  person: (id) => `/person/${id}`,
  favoriteList: "/favorites",
  reviewList: "/reviews",
  passwordUpdate: "password-update",
  donate: "/donate"
};

const routes = [
  {
    index: true,
    element: <HomePage />,
    state: "home"
  },
  {
    path: "/person/:personId",
    element: <PersonDetail />,
    state: "person.detail"
  },
  {
    path: "/search",
    element: <MediaSearch />,
    state: "search"
  },
  {
    path: "/password-update",
    element: (
      <ProtectedPage>
        <PasswordUpdate />
      </ProtectedPage>
    ),
    state: "password.update"
  },
  {
    path: "/favorites",
    element: (
      <ProtectedPage>
        <FavoriteList />
      </ProtectedPage>
    ),
    state: "favorites"
  },
  {
    path: "/reviews",
    element: (
      <ProtectedPage>
        <ReviewList />
      </ProtectedPage>
    ),
    state: "reviews"
  },
  {
    path: "/donate",
    element: <DonatePage />,
    state: "donate"
  },

  // =========================================
  // THÊM: Routes cho ADMIN PANEL
  // =========================================
  {
    path: "/admin",
    element: (
      <AdminGuard>
        <AdminVideoList />
      </AdminGuard>
    ),
    state: "admin.list"
  },
  {
    path: "/admin/add",
    element: (
      <AdminGuard>
        <AdminVideoForm />
      </AdminGuard>
    ),
    state: "admin.add"
  },
  {
    path: "/admin/edit/:videoId",
    element: (
      <AdminGuard>
        <AdminVideoForm />
      </AdminGuard>
    ),
    state: "admin.edit"
  },

  {
    path: "/:mediaType",
    element: <MediaList />
  },
  {
    path: "/:mediaType/:mediaId",
    element: <MediaDetail />
  }
];

export default routes;
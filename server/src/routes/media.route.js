import express from "express";
import mediaController from "../controllers/media.controller.js";

const router = express.Router(); 

router.get("/search", mediaController.search);
router.get("/detail/:mediaId", mediaController.getDetail);

// Sửa lỗi: Genres cần bắt mediaType
router.get("/genres/:mediaType", mediaController.getGenres); 

// LỖI CUỐI CÙNG: Route này phải bắt được cả 2 tham số mediaType và mediaCategory
router.get("/:mediaType/:mediaCategory", mediaController.getList);

export default router;
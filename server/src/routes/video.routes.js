import express from "express";
import videoController from "../controllers/video.controller.js";
import tokenMiddleware from "../middlewares/token.middleware.js";
import adminMiddleware from "../middlewares/admin.middleware.js";

const router = express.Router();


router.get(
    "/search", 
    videoController.searchVideos
);

router.get(
    "/:videoId", 
    videoController.getVideoDetail
);



router.get(
    "/",
    tokenMiddleware.auth,
    adminMiddleware.adminGuard,
    videoController.getVideos
);

router.post(
    "/",
    tokenMiddleware.auth,
    adminMiddleware.adminGuard,
    videoController.createVideo
);

router.put(
    "/:videoId",
    tokenMiddleware.auth,
    adminMiddleware.adminGuard,
    videoController.updateVideo
);

router.delete(
    "/:videoId",
    tokenMiddleware.auth,
    adminMiddleware.adminGuard,
    videoController.deleteVideo
);

export default router;
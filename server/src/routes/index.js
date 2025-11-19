import express from 'express';
import userRoutes from './user.route.js';
import mediaRoutes from './media.route.js';
import reviewRoutes from './review.route.js';
import videoRoutes from './video.routes.js';

const router = express.Router();

router.use('/user', userRoutes);
router.use('/review', reviewRoutes);
router.use('/videos', videoRoutes); 

// THAY THẾ: Gắn mediaRoutes ở root để nó không tiêu thụ biến mediaType
router.use('/', mediaRoutes); 

export default router;  
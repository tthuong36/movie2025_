import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
    },
    videoUrl: {
        type: String,
        required: true,
    },
    imgUrl: {
        type: String,
    },
    category: {
        type: [String], 
        default: [],
    },
    views: {
        type: Number,
        default: 0,
    },
    rating: {
        type: Number,
        default: 0,
    },
    duration: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });

videoSchema.index({ title: 'text', description: 'text', category: 'text' });

const Video = mongoose.model("Video", videoSchema);

export default Video;
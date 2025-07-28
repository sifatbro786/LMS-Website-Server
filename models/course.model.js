const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    user: Object,
    rating: {
        type: Number,
        default: 0,
    },
    comment: String,
});

const linkSchema = new mongoose.Schema({
    title: String,
    url: String,
});

const commentSchema = new mongoose.Schema({
    user: Object,
    comment: String,
    commentReplies: [Object],
});

const courseDataSchema = new mongoose.Schema({
    videoUrl: String,
    videoThumbnail: String,
    title: String,
    videoSection: String,
    description: String,
    videoLength: Number,
    videoPlayer: String,
    links: [linkSchema],
    suggestion: String,
    questions: [commentSchema],
});

const courseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    estimatedTime: {
        type: Number,
    },
    thumbnail: {
        public_id: {
            required: true,
            type: String,
        },
        url: {
            required: true,
            type: String,
        },
    },
    tags: {
        type: String,
        required: true,
    },
    level: {
        type: String,
        required: true,
    },
    demoUrl: {
        type: String,
        required: true,
    },
    benefits: [
        {
            title: String,
        },
    ],
    prerequisites: [
        {
            title: String,
        },
    ],
    reviews: [reviewSchema],
    courseData: [courseDataSchema],
    ratings: {
        type: Number,
        default: 0,
    },
    purchased: {
        type: Number,
        default: 0,
    },
});

const CourseModel = mongoose.models.Course ?? mongoose.model("Course", courseSchema);

module.exports = CourseModel;

const { CatchAsyncError } = require("../middleware/catchAsyncError");
const ErrorHandler = require("../utils/ErrorHandler");
const { cloudinary } = require("../utils/cloudinary");
const { createCourse } = require("../services/course.service");
const CourseModel = require("../models/course.model");
const { redis } = require("../utils/redis");

//* upload course:
const uploadCourse = CatchAsyncError(async (req, res, next) => {
    try {
        const data = req.body;
        const thumbnail = data.thumbnail;

        if (thumbnail) {
            const myCloud = await cloudinary.uploader.upload(thumbnail, {
                folder: "courses",
            });

            data.thumbnail = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            };
        }

        createCourse(data, res);
    } catch (err) {
        return next(new ErrorHandler(err.message, 500));
    }
});

//* edit course:
const editCourse = CatchAsyncError(async (req, res, next) => {
    try {
        const data = req.body;

        const thumbnail = data.thumbnail;
        if (thumbnail) {
            await cloudinary.uploader.destroy(thumbnail.public_id);

            const myCloud = await cloudinary.uploader.upload(thumbnail, {
                folder: "courses",
            });
            data.thumbnail = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            };
        }

        const courseId = req.params.id;
        const course = await CourseModel.findByIdAndUpdate(
            courseId,
            {
                $set: data,
            },
            { new: true },
        );

        res.status(200).json({
            success: true,
            message: "Course updated successfully",
            course,
        });
    } catch (err) {
        return next(new ErrorHandler(err.message, 500));
    }
});

//* get single course --- without purchasing:
const getSingleCourse = CatchAsyncError(async (req, res, next) => {
    try {
        const courseId = req.params.id;

        const isCacheExist = await redis.get(courseId);
        if (isCacheExist) {
            const course = JSON.parse(isCacheExist);

            res.status(200).json({
                success: true,
                course,
            });
        } else {
            const course = await CourseModel.findById(courseId).select(
                "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links",
            );

            await redis.set(courseId, JSON.stringify(course));

            res.status(200).json({
                success: true,
                course,
            });
        }
    } catch (err) {
        return next(new ErrorHandler(err.message, 500));
    }
});

//* get single course --- without purchasing:
const getAllCourses = CatchAsyncError(async (req, res, next) => {
    try {
        const isCacheExist = await redis.get("allCourses");
        if (isCacheExist) {
            const courses = JSON.parse(isCacheExist);

            res.status(200).json({
                success: true,
                courses,
            });
        } else {
            const courses = await CourseModel.find().select(
                "-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links",
            );

            await redis.set("allCourses", JSON.stringify(courses));

            res.status(200).json({
                success: true,
                courses,
            });
        }
    } catch (err) {
        return next(new ErrorHandler(err.message, 500));
    }
});

//* get course content only for valid user:
const getCourseByUser = CatchAsyncError(async (req, res, next) => {
    try {
        const userCourseList = req.user?.courses;
        const courseId = req.params.id;

        const courseExist = userCourseList.find((course) => course?._id.toString() === courseId);
        if (!courseExist) {
            return next(new ErrorHandler("You are not eligible to access this course", 400));
        }

        const course = await CourseModel.findById(courseId);
        const content = course?.courseData;

        res.status(200).json({
            success: true,
            content,
        });
    } catch (err) {
        return next(new ErrorHandler(err.message, 500));
    }
});

//* add question in course:
const addQuestion = CatchAsyncError(async (req, res, next) => {
    try {
        const { question, courseId, contentId } = req.body;
    } catch (err) {
        return next(new ErrorHandler(err.message, 500));
    }
});

module.exports = {
    uploadCourse,
    editCourse,
    getSingleCourse,
    getAllCourses,
    getCourseByUser,
    addQuestion,
};

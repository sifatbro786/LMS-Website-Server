const { CatchAsyncError } = require("../middleware/catchAsyncError");
const ErrorHandler = require("../utils/ErrorHandler");
const { cloudinary } = require("../utils/cloudinary");
const { createCourse } = require("../services/course.service");
const CourseModel = require("../models/course.model");
const { redis } = require("../utils/redis");
const mongoose = require("mongoose");
const ejs = require("ejs");
const path = require("path");
const sendMail = require("../utils/sendMail");
const notificationModel = require("../models/notification.model");

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
        const course = await CourseModel.findById(courseId);

        if (!mongoose.Types.ObjectId.isValid(contentId)) {
            return next(new ErrorHandler("Invalid content id", 400));
        }

        const courseContent = course?.courseData.find((item) => item._id.equals(contentId));
        if (!courseContent) {
            return next(new ErrorHandler("Invalid content id", 400));
        }

        //? create a new question object:
        const newQuestion = {
            user: req.user,
            question,
            questionReplies: [],
        };
        //? add this question to our course content:
        courseContent.questions.push(newQuestion);

        //? send notification to admin:
        await notificationModel.create({
            user: req.user?._id,
            title: "New Question Received",
            message: `${req.user.name} has asked a question in ${courseContent.title}`,
        });

        //? save the updated course:
        await course.save();

        res.status(200).json({
            success: true,
            message: "Question added successfully",
            course,
        });
    } catch (err) {
        return next(new ErrorHandler(err.message, 500));
    }
});

//* add answer in course question:
const addAnswer = CatchAsyncError(async (req, res, next) => {
    try {
        const { answer, questionId, courseId, contentId } = req.body;
        const course = await CourseModel.findById(courseId);

        if (!mongoose.Types.ObjectId.isValid(contentId)) {
            return next(new ErrorHandler("Invalid content id", 400));
        }

        const courseContent = course?.courseData.find((item) => item._id.equals(contentId));
        if (!courseContent) {
            return next(new ErrorHandler("Invalid content id", 400));
        }

        const question = courseContent?.questions.find((item) => item._id.equals(questionId));
        if (!question) {
            return next(new ErrorHandler("Invalid question id", 400));
        }

        //? create a new answer object:
        const newAnswer = {
            user: req.user,
            answer,
        };

        //? add this answer to our course question:
        question.questionReplies.push(newAnswer);

        //? save the updated course:
        await course.save();

        if (req.user?._id === question?.user?._id) {
            //? send notification to admin:
            await notificationModel.create({
                user: req.user?._id,
                title: "New Question Reply Received",
                message: `${req.user.name} has replied to your question in ${courseContent.title}`,
            });
        } else {
            const data = {
                name: question?.user?.name,
                title: courseContent?.title,
            };

            const html = await ejs.renderFile(
                path.join(__dirname, "../mails/question-reply.ejs"),
                data,
            );

            try {
                await sendMail({
                    email: question?.user?.email,
                    subject: "New reply on your question",
                    template: "question-reply.ejs",
                    data,
                });
            } catch (err) {
                return next(new ErrorHandler(err.message, 500));
            }
        }

        res.status(200).json({
            success: true,
            message: "Answer added successfully",
            course,
        });
    } catch (err) {
        return next(new ErrorHandler(err.message, 500));
    }
});

//* add review in course:
const addReview = CatchAsyncError(async (req, res, next) => {
    try {
        const userCOurseList = req.user?.courses;
        const courseId = req.params.id;

        //?  check if courseId already exist in userCourseList based on its _id:
        const courseExist = userCOurseList.some(
            (course) => course?._id.toString() === courseId.toString(),
        );
        if (!courseExist) {
            return next(new ErrorHandler("You are not eligible to access this course", 400));
        }

        const course = await CourseModel.findById(courseId);
        const { review, rating } = req.body;

        const reviewData = {
            user: req.user,
            comment: review,
            rating,
        };

        course.reviews.push(reviewData);

        let avg = 0;
        course.reviews.forEach((rev) => {
            avg += rev.rating;
        });

        if (course) {
            course.ratings = avg / course.reviews.length;
        }

        await course.save();

        //* send notification to creator of course
        const notification = {
            title: "New Review Received!",
            message: `${req.user.name} has given a review in your course: ${course.name}`,
        };
        // TODO: create notification:

        res.status(200).json({
            success: true,
            message: "Review added successfully",
            course,
        });
    } catch (err) {
        return next(new ErrorHandler(err.message, 500));
    }
});

//* add reply in review:
const addReplyToReview = CatchAsyncError(async (req, res, next) => {
    try {
        const { comment, reviewId, courseId } = req.body;

        const course = await CourseModel.findById(courseId);
        if (!course) {
            return next(new ErrorHandler("Course not found", 400));
        }

        const review = await course.reviews.find((item) => item._id.toString() === reviewId);
        if (!review) {
            return next(new ErrorHandler("Review not found", 400));
        }

        const replyData = {
            user: req.user,
            comment,
        };
        if (!review.commentReplies) {
            review.commentReplies = [];
        }
        review.commentReplies.push(replyData);

        await course.save();

        res.status(200).json({
            success: true,
            message: "Reply added successfully",
            course,
        });
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
    addAnswer,
    addReview,
    addReplyToReview,
};

const { CatchAsyncError } = require("../middleware/catchAsyncError");
const CourseModel = require("../models/course.model");

//* create course:
const createCourse = CatchAsyncError(async (data, res) => {
    const course = await CourseModel.create(data);

    res.status(201).json({
        success: true,
        message: "Course created successfully",
        course,
    });
});

//* get all courses:
const getAllCoursesService = async (req, res) => {
    const courses = await CourseModel.find().sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        courses,
    });
};

module.exports = { createCourse, getAllCoursesService };

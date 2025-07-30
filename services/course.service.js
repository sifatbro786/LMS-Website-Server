const CourseModel = require("../models/course.model");
const { CatchAsyncError } = require("../middleware/catchAsyncError");

const createCourse = CatchAsyncError(async (data, res) => {
    const course = await CourseModel.create(data);

    res.status(201).json({
        success: true,
        message: "Course created successfully",
        course,
    });
});

module.exports = { createCourse };

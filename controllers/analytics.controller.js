const ErrorHandler = require("../utils/ErrorHandler");
const { CatchAsyncError } = require("../middleware/catchAsyncError");
const { generateLast12MonthsData } = require("../utils/analytics.generator");
const UserModel = require("../models/user.model");
const CourseModel = require("../models/course.model");
const OrderModel = require("../models/order.model");

//* get users analytics --> admin only:
const getUsersAnalytics = CatchAsyncError(async (req, res) => {
    try {
        const users = await generateLast12MonthsData(UserModel);

        res.status(200).json({
            success: true,
            users,
        });
    } catch (err) {
        return next(new ErrorHandler(err.message, 500));
    }
});

//* get courses analytics --> admin only:
const getCoursesAnalytics = CatchAsyncError(async (req, res) => {
    try {
        const courses = await generateLast12MonthsData(CourseModel);

        res.status(200).json({
            success: true,
            courses,
        });
    } catch (err) {
        return next(new ErrorHandler(err.message, 500));
    }
});

//* get orders analytics --> admin only:
const getOrdersAnalytics = CatchAsyncError(async (req, res) => {
    try {
        const orders = await generateLast12MonthsData(OrderModel);

        res.status(200).json({
            success: true,
            orders,
        });
    } catch (err) {
        return next(new ErrorHandler(err.message, 500));
    }
});

module.exports = { getUsersAnalytics, getCoursesAnalytics, getOrdersAnalytics };

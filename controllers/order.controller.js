const { CatchAsyncError } = require("../middleware/catchAsyncError");
const ErrorHandler = require("../utils/ErrorHandler");
const CourseModel = require("../models/course.model");
const UserModel = require("../models/user.model");
const NotificationModel = require("../models/notification.model");
const path = require("path");
const ejs = require("ejs");
const sendMail = require("../utils/sendMail");
const { newOrder, getAllOrdersService } = require("../services/order.service");

//* create order:
const createOrder = CatchAsyncError(async (req, res, next) => {
    try {
        const { courseId, payment_info } = req.body;

        const user = await UserModel.findById(req.user._id);

        const courseExistInUser = user.courses.some((course) => course._id.toString() === courseId);
        if (courseExistInUser) {
            return next(new ErrorHandler("You have already purchased this course", 400));
        }

        const course = await CourseModel.findById(courseId);
        if (!course) {
            return next(new ErrorHandler("Course not found", 400));
        }

        const data = {
            courseId: course?._id,
            userId: user?._id,
            payment_info,
        };

        const mailData = {
            order: {
                _id: course._id.toString().slice(0, 6),
                name: course.name,
                price: course.price,
                date: new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                }),
            },
        };

        const html = await ejs.renderFile(
            path.join(__dirname, "../mails/order-confirmation.ejs"),
            mailData,
        );

        try {
            if (user) {
                await sendMail({
                    email: user.email,
                    subject: "Order confirmation",
                    template: "order-confirmation.ejs",
                    data: mailData,
                });
            }
        } catch (err) {
            return next(new ErrorHandler(err.message, 500));
        }

        user?.courses.push(course?._id);
        await user.save();

        //? send notification to admin:
        await NotificationModel.create({
            user: user?._id,
            title: "New Order",
            message: `${user.name} has purchased ${course.name}`,
        });

        course.purchased = (course.purchased || 0) + 1;
        await course.save();

        newOrder(data, res);
    } catch (err) {
        return next(new ErrorHandler(err.message, 500));
    }
});

//* get all orders -- admin only:
const getAllOrders = CatchAsyncError(async (req, res, next) => {
    try {
        getAllOrdersService(req, res);
    } catch (err) {
        return next(new ErrorHandler(err.message, 500));
    }
});

module.exports = {
    createOrder,
    getAllOrders,
};

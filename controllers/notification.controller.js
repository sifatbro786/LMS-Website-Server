const { CatchAsyncError } = require("../middleware/catchAsyncError");
const ErrorHandler = require("../utils/ErrorHandler");
const CourseModel = require("../models/course.model");
const UserModel = require("../models/user.model");
const NotificationModel = require("../models/notification.model");
const path = require("path");
const ejs = require("ejs");

//* get all notification --- only for admin:
const getNotifications = CatchAsyncError(async (req, res) => {
    try {
        const notifications = await NotificationModel.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            notifications,
        });
    } catch (err) {
        return next(new ErrorHandler(err.message, 500));
    }
});

//* update notification status --only for admin:
const updateNotification = CatchAsyncError(async (req, res) => {
    try {
        const notification = await NotificationModel.findById(req.params.id);
        if (!notification) {
            return next(new ErrorHandler("Notification not found", 404));
        } else {
            notification.status ? (notification.status = "read") : notification.status;
            await notification.save();
        }

        const notifications = await NotificationModel.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            notifications,
        });
    } catch (err) {
        return next(new ErrorHandler(err.message, 500));
    }
});

module.exports = { getNotifications, updateNotification };

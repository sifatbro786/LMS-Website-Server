const { CatchAsyncError } = require("../middleware/catchAsyncError");
const ErrorHandler = require("../utils/ErrorHandler");
const NotificationModel = require("../models/notification.model");
const cron = require("node-cron");

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

//* delete notification -- only for admin:
cron.schedule("0 0 0 * * *", async () => {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    await NotificationModel.deleteMany({ status: "read", createdAt: { $lt: thirtyDaysAgo } });

    console.log("Deleted notifications older than 30 days");
});

module.exports = { getNotifications, updateNotification };

const express = require("express");
const { isAuthenticated, authorizeRoles } = require("../middleware/auth");
const { getNotifications, updateNotification } = require("../controllers/notification.controller");
const { updateAccessToken } = require("../controllers/user.controller");

const notificationRoute = express.Router();

notificationRoute.get(
    "/get-all-notifications",
    updateAccessToken,
    isAuthenticated,
    authorizeRoles("admin"),
    getNotifications,
);
notificationRoute.put(
    "/update-notification/:id",
    updateAccessToken,
    isAuthenticated,
    authorizeRoles("admin"),
    updateNotification,
);

module.exports = notificationRoute;

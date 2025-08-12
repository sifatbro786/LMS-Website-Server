const express = require("express");
const { isAuthenticated, authorizeRoles } = require("../middleware/auth");
const {
    getUsersAnalytics,
    getCoursesAnalytics,
    getOrdersAnalytics,
} = require("../controllers/analytics.controller");
const { updateAccessToken } = require("../controllers/user.controller");

const analyticsRoute = express.Router();

analyticsRoute.get(
    "/get-users-analytics",
    updateAccessToken,
    isAuthenticated,
    authorizeRoles("admin"),
    getUsersAnalytics,
);
analyticsRoute.get(
    "/get-courses-analytics",
    updateAccessToken,
    isAuthenticated,
    authorizeRoles("admin"),
    getCoursesAnalytics,
);
analyticsRoute.get(
    "/get-orders-analytics",
    updateAccessToken,
    isAuthenticated,
    authorizeRoles("admin"),
    getOrdersAnalytics,
);

module.exports = analyticsRoute;

const express = require("express");
const { isAuthenticated, authorizeRoles } = require("../middleware/auth");
const {
    getUsersAnalytics,
    getCoursesAnalytics,
    getOrdersAnalytics,
} = require("../controllers/analytics.controller");

const analyticsRoute = express.Router();

analyticsRoute.get(
    "/get-users-analytics",
    isAuthenticated,
    authorizeRoles("admin"),
    getUsersAnalytics,
);
analyticsRoute.get(
    "/get-courses-analytics",
    isAuthenticated,
    authorizeRoles("admin"),
    getCoursesAnalytics,
);
analyticsRoute.get(
    "/get-orders-analytics",
    isAuthenticated,
    authorizeRoles("admin"),
    getOrdersAnalytics,
);

module.exports = analyticsRoute;

const express = require("express");
const { isAuthenticated, authorizeRoles } = require("../middleware/auth");
const { createOrder, getAllOrders } = require("../controllers/order.controller");
const { updateAccessToken } = require("../controllers/user.controller");

const orderRoute = express.Router();

orderRoute.post("/create-order", updateAccessToken, isAuthenticated, createOrder);
orderRoute.get(
    "/get-orders",
    updateAccessToken,
    isAuthenticated,
    authorizeRoles("admin"),
    getAllOrders,
);

module.exports = orderRoute;

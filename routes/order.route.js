const express = require("express");
const { isAuthenticated, authorizeRoles } = require("../middleware/auth");
const { createOrder, getAllOrders } = require("../controllers/order.controller");

const orderRoute = express.Router();

orderRoute.post("/create-order", isAuthenticated, createOrder);
orderRoute.get("/get-orders", isAuthenticated, authorizeRoles("admin"), getAllOrders);

module.exports = orderRoute;

const express = require("express");
const { isAuthenticated } = require("../middleware/auth");
const { createOrder } = require("../controllers/order.controller");

const orderRoute = express.Router();

orderRoute.post("/create-order", isAuthenticated, createOrder);

module.exports = orderRoute;

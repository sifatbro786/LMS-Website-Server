const express = require("express");
const { isAuthenticated } = require("../middleware/auth");
const { createOrder } = require("../controllers/order.controller");

const orderRouter = express.Router();

orderRouter.post("/create-order", isAuthenticated, createOrder);

module.exports = orderRouter;

const { CatchAsyncError } = require("../middleware/catchAsyncError");
const OrderModel = require("../models/order.model");

//* create order:
const newOrder = CatchAsyncError(async (data, res) => {
    const order = await OrderModel.create(data);

    res.status(200).json({
        success: true,
        message: "Order created successfully",
        order,
    });
});

//* get all orders:
const getAllOrdersService = async (req, res) => {
    const orders = await OrderModel.find().sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        orders,
    });
};

module.exports = { newOrder, getAllOrdersService };

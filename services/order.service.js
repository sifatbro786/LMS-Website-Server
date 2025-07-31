const { CatchAsyncError } = require("../middleware/catchAsyncError");
const OrderModel = require("../models/order.model");

const newOrder = CatchAsyncError(async (data, res) => {
    const order = await OrderModel.create(data);

    res.status(200).json({
        success: true,
        message: "Order created successfully",
        order,
    });
});

module.exports = { newOrder };

const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        courseId: {
            type: String,
            required: true,
        },
        userId: {
            type: String,
            required: true,
        },
        payment_info: {
            type: Object,
            // required: true,
        },
    },
    {
        timestamps: true,
    },
);

const OrderModel = mongoose.models.Order ?? mongoose.model("Order", orderSchema);

module.exports = OrderModel;

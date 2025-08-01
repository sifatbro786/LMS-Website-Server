const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { errorMiddleware } = require("./middleware/error");
const userRoute = require("./routes/user.route");
const courseRoute = require("./routes/course.route");
const orderRoute = require("./routes/order.route");
const notificationRoute = require("./routes/notification.route");
const analyticsRoute = require("./routes/analytics.route");
const layoutRoute = require("./routes/layout.route");

const app = express();

//* body parser
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

//* cookie parser:
app.use(cookieParser());

const allowedOrigins = process.env.ORIGIN?.split(",") || [];

app.use(
    cors({
        origin: allowedOrigins,
        credentials: true,
    }),
);

//* routes:
app.use("/api/v1", userRoute, courseRoute, orderRoute, notificationRoute, analyticsRoute, layoutRoute);

//* testing route
app.get("/", (req, res) => {
    res.send("✅ Basic server is running");
});

//* unhandled route:
// app.get("*", (req, res) => {
//     res.status(404).json({
//         success: false,
//         message: "Route not found",
//     });
// });

//* error handler:
app.use(errorMiddleware);

module.exports = app;

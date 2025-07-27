const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { errorMiddleware } = require("./middleware/error");
const userRouter = require("./routes/user.route");

const app = express();

//* middlewares
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());

const allowedOrigins = process.env.ORIGIN?.split(",") || [];

app.use(
    cors({
        origin: allowedOrigins,
        credentials: true,
    }),
);

//* routes:
app.use("/api/v1", userRouter);

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

const { CatchAsyncError } = require("./catchAsyncError");
const ErrorHandler = require("../utils/ErrorHandler");
const jwt = require("jsonwebtoken");
const { redis } = require("../utils/redis");

//* authenticated user:
const isAuthenticated = CatchAsyncError(async (req, res, next) => {
    const access_token = req.cookies.access_token;
    if (!access_token) {
        return next(new ErrorHandler("Please login to access this resource", 400));
    }

    const decoded = jwt.verify(access_token, process.env.ACCESS_TOKEN);
    if (!decoded) {
        return next(new ErrorHandler("Your access token is invalid", 400));
    }

    const user = await redis.get(decoded.id);
    if (!user) {
        return next(new ErrorHandler("User not found", 400));
    }

    req.user = JSON.parse(user);
    next();
});

//* validate user role:
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user?.role || "")) {
            return next(
                new ErrorHandler(
                    `Role: ${req.user?.role} is not allowed to access this resource`,
                    403,
                ),
            );
        }
        next();
    };
};

module.exports = { isAuthenticated, authorizeRoles };

const { CatchAsyncError } = require("./catchAsyncError");
const ErrorHandler = require("../utils/ErrorHandler");
const jwt = require("jsonwebtoken");
const { redis } = require("../utils/redis");

//* authenticated user:
const isAuthenticated = CatchAsyncError(async (req, res, next) => {
    try {
        const access_token = req.cookies.access_token;

        if (!access_token) {
            return next(new ErrorHandler("Please login to access this resource", 401));
        }

        // Verify the access token
        let decoded;
        try {
            decoded = jwt.verify(access_token, process.env.ACCESS_TOKEN);
        } catch (error) {
            if (error.name === "TokenExpiredError") {
                return next(new ErrorHandler("Access token expired", 401));
            }
            if (error.name === "JsonWebTokenError") {
                return next(new ErrorHandler("Invalid access token", 401));
            }
            return next(new ErrorHandler("Token verification failed", 401));
        }

        if (!decoded || !decoded.id) {
            return next(new ErrorHandler("Invalid token payload", 401));
        }

        // Get user from Redis
        const user = await redis.get(decoded.id);
        if (!user) {
            return next(new ErrorHandler("User session expired, please login again", 401));
        }

        try {
            req.user = JSON.parse(user);
        } catch (parseError) {
            return next(new ErrorHandler("Invalid user session data", 401));
        }

        next();
    } catch (error) {
        return next(new ErrorHandler("Authentication failed", 500));
    }
});

//* validate user role:
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return next(new ErrorHandler("User not authenticated", 401));
            }

            const userRole = req.user.role;
            if (!userRole) {
                return next(new ErrorHandler("User role not found", 403));
            }

            if (!roles.includes(userRole)) {
                return next(
                    new ErrorHandler(
                        `Role: ${userRole} is not allowed to access this resource`,
                        403,
                    ),
                );
            }

            next();
        } catch (error) {
            return next(new ErrorHandler("Authorization failed", 500));
        }
    };
};

module.exports = { isAuthenticated, authorizeRoles };

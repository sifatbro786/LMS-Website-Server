const dotenv = require("dotenv");
const { redis } = require("./redis");

dotenv.config();

//* options for cookies:
const accessTokenOptions = {
    expires: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    maxAge: 5 * 60 * 1000, // 5 minutes
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
};

const refreshTokenOptions = {
    expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
    maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
};

const sendToken = (user, statusCode, res) => {
    const accessToken = user.getJWTToken();
    const refreshToken = user.getRefreshToken();

    //* upload session to redis:
    redis.set(user._id.toString(), JSON.stringify(user));

    //* only set secure to true in production:
    if (process.env.NODE_ENV === "production") {
        accessTokenOptions.secure = true;
    }

    //* cookie options:
    res.cookie("access_token", accessToken, accessTokenOptions);
    res.cookie("refresh_token", refreshToken, refreshTokenOptions);

    res.status(statusCode).json({
        success: true,
        user,
        accessToken,
    });
};

module.exports = { sendToken, accessTokenOptions, refreshTokenOptions };

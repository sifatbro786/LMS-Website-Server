const dotenv = require("dotenv");
const { redis } = require("./redis");

dotenv.config();

const sendToken = (user, statusCode, res) => {
    const accessToken = user.getJWTToken();
    const refreshToken = user.getRefreshToken();

    //* upload session to redis:
    redis.set(user._id.toString(), JSON.stringify(user));

    //* parse .env variables to integrates with fallback values:
    const accessTokenExpire = parseInt(process.env.ACCESS_TOKEN_EXPIRE || "300", 10);
    const refreshTokenExpire = parseInt(process.env.REFRESH_TOKEN_EXPIRE || "1200", 10);

    //* options for cookies:
    const accessTokenOptions = {
        expires: new Date(Date.now() + accessTokenExpire * 1000),
        maxAge: accessTokenExpire * 1000,
        httpOnly: true,
        sameSite: "lax",
    };

    const refreshTokenOptions = {
        expires: new Date(Date.now() + refreshTokenExpire * 1000),
        maxAge: refreshTokenExpire * 1000,
        httpOnly: true,
        sameSite: "lax",
    };

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

module.exports = { sendToken };

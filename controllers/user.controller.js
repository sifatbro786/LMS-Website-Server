const path = require("path");
const ejs = require("ejs");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const ErrorHandler = require("../utils/ErrorHandler");
const sendMail = require("../utils/sendMail");
const { CatchAsyncError } = require("../middleware/catchAsyncError");
const { sendToken, accessTokenOptions, refreshTokenOptions } = require("../utils/jwt");
const { redis } = require("../utils/redis");
const { getUserById } = require("../services/user.service");

//* register user:
const registrationUser = CatchAsyncError(async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        const isEmailExists = await userModel.findOne({ email });
        if (isEmailExists) {
            return next(new ErrorHandler("Email already exists", 400));
        }

        const user = { name, email, password };

        const activationToken = createActivationToken(user);
        const activationCode = activationToken.activationCode;

        const data = { user: { name: user.name }, activationCode };

        const html = await ejs.renderFile(
            path.join(__dirname, "../mails/activation-mail.ejs"),
            data,
        );

        try {
            await sendMail({
                email: user.email,
                subject: "Activate your account",
                template: "activation-mail.ejs",
                data,
            });

            res.status(201).json({
                success: true,
                message: `Please check your email: ${user.email} to activate your account!`,
                activationToken: activationToken.token,
            });
        } catch (err) {
            return next(new ErrorHandler(err.message, 400));
        }
    } catch (err) {
        return next(new ErrorHandler(err.message, 500));
    }
});

const createActivationToken = (user) => {
    const activationCode = Math.floor(1000 + Math.random() * 9000).toString();

    const token = jwt.sign({ user, activationCode }, process.env.ACTIVATION_SECRET, {
        expiresIn: "5m",
    });

    return { token, activationCode };
};

//* activate user:
const activateUser = CatchAsyncError(async (req, res, next) => {
    try {
        const { activation_token, activation_code } = req.body;

        const newUser = jwt.verify(activation_token, process.env.ACTIVATION_SECRET);
        if (newUser.activationCode !== activation_code) {
            return next(new ErrorHandler("Invalid activation code", 400));
        }

        const { name, email, password } = newUser.user;
        const existUser = await userModel.findOne({ email });
        if (existUser) {
            return next(new ErrorHandler("User already exists", 400));
        }

        const user = await userModel.create({ name, email, password });

        res.status(201).json({
            success: true,
            message: "Account activated successfully!",
            user,
        });
    } catch (err) {
        return next(new ErrorHandler(err.message, 500));
    }
});

//* login user:
const loginUser = CatchAsyncError(async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return next(new ErrorHandler("Please enter email and password", 400));
        }

        const user = await userModel.findOne({ email }).select("+password");
        if (!user) {
            return next(new ErrorHandler("Invalid email or password", 400));
        }

        const isPasswordMatched = await user.comparePassword(password);
        if (!isPasswordMatched) {
            return next(new ErrorHandler("Invalid email or password", 400));
        }

        sendToken(user, 200, res);
    } catch (err) {
        return next(new ErrorHandler(err.message, 500));
    }
});

//* logout user:
const logoutUser = CatchAsyncError(async (req, res, next) => {
    try {
        res.cookie("access_token", "", { maxAge: 1 });
        res.cookie("refresh_token", "", { maxAge: 1 });

        redis.del(req.user._id.toString());

        res.status(200).json({
            success: true,
            message: "Logged out successfully!",
        });
    } catch (err) {
        return next(new ErrorHandler(err.message, 500));
    }
});

//* update access token:
const updateAccessToken = CatchAsyncError(async (req, res, next) => {
    try {
        const refresh_token = req.cookies.refresh_token;
        const decoded = jwt.verify(refresh_token, process.env.REFRESH_TOKEN);
        if (!decoded) {
            return next(new ErrorHandler("Your refresh token is invalid", 400));
        }

        const session = await redis.get(decoded.id);
        if (!session) {
            return next(new ErrorHandler("User not found", 400));
        }

        const user = JSON.parse(session);
        const accessToken = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN, {
            expiresIn: "5m",
        });
        const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN, {
            expiresIn: "3d",
        });

        res.cookie("access_token", accessToken, accessTokenOptions);
        res.cookie("refresh_token", refreshToken, refreshTokenOptions);

        res.status(200).json({
            status: true,
            accessToken,
        });
    } catch (err) {
        return next(new ErrorHandler(err.message, 500));
    }
});

//* get user info:
const getUserInfo = CatchAsyncError(async (req, res, next) => {
    try {
        const userId = req.user._id;
        await getUserById(userId, res);
    } catch (err) {
        return next(new ErrorHandler(err.message, 500));
    }
});

//* social auth:
const socialAuth = CatchAsyncError(async (req, res, next) => {
    try {
        const { email, name, avatar } = req.body;

        const user = await userModel.findOne({ email });
        if (!user) {
            const newUser = await userModel.create({ email, name, avatar });
            sendToken(newUser, 200, res);
        } else {
            sendToken(user, 200, res);
        }
    } catch (err) {
        return next(new ErrorHandler(err.message, 500));
    }
});

module.exports = {
    registrationUser,
    createActivationToken,
    activateUser,
    loginUser,
    logoutUser,
    updateAccessToken,
    getUserInfo,
    socialAuth,
};

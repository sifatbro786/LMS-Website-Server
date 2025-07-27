const path = require("path");
const ejs = require("ejs");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const ErrorHandler = require("../utils/ErrorHandler");
const sendMail = require("../utils/sendMail");
const { CatchAsyncError } = require("../middleware/catchAsyncError");

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

module.exports = {
    registrationUser,
    createActivationToken,
    activateUser,
};

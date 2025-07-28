const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const emailRegexPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please enter your name"],
        },
        email: {
            type: String,
            required: [true, "Please enter your email"],
            match: [emailRegexPattern, "Please enter a valid email"],
            unique: true,
        },
        password: {
            type: String,
            minlength: [6, "Password should be at least 6 characters"],
            select: false,
        },
        avatar: {
            public_id: String,
            url: String,
        },
        role: {
            type: String,
            default: "user",
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        courses: [
            {
                courseIds: String,
            },
        ],
    },
    { timestamps: true },
);

// hash password before saving:
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// signin access token:
userSchema.methods.getJWTToken = function () {
    return jwt.sign({ id: this._id }, process.env.ACCESS_TOKEN, {
        expiresIn: "5m",
    });
};

// signin refresh token:
userSchema.methods.getRefreshToken = function () {
    return jwt.sign({ id: this._id }, process.env.REFRESH_TOKEN, {
        expiresIn: "3d",
    });
};

// compare password:
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const UserModel = mongoose.models.User ?? mongoose.model("User", userSchema);

module.exports = UserModel;

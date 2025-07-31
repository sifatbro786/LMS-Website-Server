const express = require("express");
const { isAuthenticated } = require("../middleware/auth");
const {
    registrationUser,
    activateUser,
    loginUser,
    logoutUser,
    updateAccessToken,
    getUserInfo,
    socialAuth,
    updateUserInfo,
    updatePassword,
    updateProfilePicture,
} = require("../controllers/user.controller");

const userRoute = express.Router();

userRoute.post("/registration", registrationUser);
userRoute.post("/activate-user", activateUser);
userRoute.post("/login", loginUser);
userRoute.post("/social-auth", socialAuth);

userRoute.get("/logout", isAuthenticated, logoutUser);
userRoute.get("/refresh", updateAccessToken);
userRoute.get("/me", isAuthenticated, getUserInfo);

userRoute.put("/update-user-info", isAuthenticated, updateUserInfo);
userRoute.put("/update-user-password", isAuthenticated, updatePassword);
userRoute.put("/update-user-avatar", isAuthenticated, updateProfilePicture);

module.exports = userRoute;

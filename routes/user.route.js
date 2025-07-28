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
} = require("../controllers/user.controller");

const userRouter = express.Router();

userRouter.post("/registration", registrationUser);
userRouter.post("/activate-user", activateUser);
userRouter.post("/login", loginUser);
userRouter.get("/logout", isAuthenticated, logoutUser);
userRouter.get("/refresh", updateAccessToken);
userRouter.get("/me", isAuthenticated, getUserInfo);
userRouter.post("/social-auth", socialAuth);

module.exports = userRouter;

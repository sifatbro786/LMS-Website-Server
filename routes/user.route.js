const express = require("express");
const {
    registrationUser,
    activateUser,
    loginUser,
    logoutUser,
} = require("../controllers/user.controller");
const { isAuthenticated } = require("../middleware/auth");

const userRouter = express.Router();

userRouter.post("/registration", registrationUser);
userRouter.post("/activate-user", activateUser);
userRouter.post("/login", loginUser);
userRouter.get("/logout", isAuthenticated, logoutUser);

module.exports = userRouter;

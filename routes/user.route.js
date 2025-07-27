const express = require("express");
const { registrationUser, activateUser } = require("../controllers/user.controller");

const userRouter = express.Router();

userRouter.post("/registration", registrationUser);

userRouter.post("/activate-user", activateUser);

module.exports = userRouter;

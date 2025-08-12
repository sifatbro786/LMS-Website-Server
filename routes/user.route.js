const express = require("express");
const { isAuthenticated, authorizeRoles } = require("../middleware/auth");
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
    getAllUsers,
    updateUserRole,
    deleteUser,
} = require("../controllers/user.controller");

const userRoute = express.Router();

userRoute.post("/registration", registrationUser);
userRoute.post("/activate-user", activateUser);
userRoute.post("/login", loginUser);
userRoute.post("/social-auth", socialAuth);

userRoute.get("/logout", isAuthenticated, logoutUser);
userRoute.get("/refresh", updateAccessToken);
userRoute.get("/me", updateAccessToken, isAuthenticated, getUserInfo);
userRoute.get(
    "/get-users",
    updateAccessToken,
    isAuthenticated,
    authorizeRoles("admin"),
    getAllUsers,
);

userRoute.put("/update-user-info", updateAccessToken, isAuthenticated, updateUserInfo);
userRoute.put("/update-user-password", updateAccessToken, isAuthenticated, updatePassword);
userRoute.put("/update-user-avatar", updateAccessToken, isAuthenticated, updateProfilePicture);
userRoute.put(
    "/update-user",
    updateAccessToken,
    isAuthenticated,
    authorizeRoles("admin"),
    updateUserRole,
);

userRoute.delete(
    "/delete-user/:id",
    updateAccessToken,
    isAuthenticated,
    authorizeRoles("admin"),
    deleteUser,
);

module.exports = userRoute;

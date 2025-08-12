const express = require("express");
const { isAuthenticated, authorizeRoles } = require("../middleware/auth");

const {
    uploadCourse,
    editCourse,
    getSingleCourse,
    getAllCourses,
    getCourseByUser,
    addQuestion,
    addAnswer,
    addReview,
    addReplyToReview,
    getAllCoursesByAdmin,
    deleteCourse,
    generateVideoUrl,
} = require("../controllers/course.controller");
const { updateAccessToken } = require("../controllers/user.controller");

const courseRoute = express.Router();

courseRoute.post(
    "/create-course",
    updateAccessToken,
    isAuthenticated,
    authorizeRoles("admin"),
    uploadCourse,
);
courseRoute.post("/getVdoCipherOTP", generateVideoUrl);

courseRoute.get("/get-course/:id", getSingleCourse);
courseRoute.get("/get-courses", getAllCourses);
courseRoute.get(
    "/get-courses",
    updateAccessToken,
    isAuthenticated,
    authorizeRoles("admin"),
    getAllCoursesByAdmin,
);
courseRoute.get("/get-course-content/:id", updateAccessToken, isAuthenticated, getCourseByUser);

courseRoute.put(
    "/edit-course/:id",
    updateAccessToken,
    isAuthenticated,
    authorizeRoles("admin"),
    editCourse,
);
courseRoute.put("/add-question", updateAccessToken, isAuthenticated, addQuestion);
courseRoute.put("/add-answer", updateAccessToken, isAuthenticated, addAnswer);
courseRoute.put("/add-review/:id", updateAccessToken, isAuthenticated, addReview);
courseRoute.put(
    "/add-reply",
    updateAccessToken,
    isAuthenticated,
    authorizeRoles("admin"),
    addReplyToReview,
);

courseRoute.delete(
    "/delete-course/:id",
    updateAccessToken,
    isAuthenticated,
    authorizeRoles("admin"),
    deleteCourse,
);

module.exports = courseRoute;

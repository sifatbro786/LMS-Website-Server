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
} = require("../controllers/course.controller");

const courseRoute = express.Router();

courseRoute.post("/create-course", isAuthenticated, authorizeRoles("admin"), uploadCourse);
courseRoute.put("/edit-course/:id", isAuthenticated, authorizeRoles("admin"), editCourse);
courseRoute.get("/get-course/:id", getSingleCourse);
courseRoute.get("/get-courses", getAllCourses);
courseRoute.get("/get-course-content/:id", isAuthenticated, getCourseByUser);
courseRoute.put("/add-question", isAuthenticated, addQuestion);
courseRoute.put("/add-answer", isAuthenticated, addAnswer);
courseRoute.put("/add-review/:id", isAuthenticated, addReview);
courseRoute.put("/add-reply", isAuthenticated, authorizeRoles("admin"), addReplyToReview);

module.exports = courseRoute;

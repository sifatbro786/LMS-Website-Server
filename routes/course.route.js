const express = require("express");
const {
    uploadCourse,
    editCourse,
    getSingleCourse,
    getAllCourses,
} = require("../controllers/course.controller");
const { isAuthenticated, authorizeRoles } = require("../middleware/auth");

const courseRouter = express.Router();

courseRouter.post("/create-course", isAuthenticated, authorizeRoles("admin"), uploadCourse);
courseRouter.put("/edit-course/:id", isAuthenticated, authorizeRoles("admin"), editCourse);
courseRouter.get("/get-course/:id", getSingleCourse);
courseRouter.get("/get-courses", getAllCourses);

module.exports = courseRouter;

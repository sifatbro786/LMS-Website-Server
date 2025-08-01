const express = require("express");
const { isAuthenticated, authorizeRoles } = require("../middleware/auth");
const { createLayout, editLayout, getLayoutByType } = require("../controllers/layout.controller");

const layoutRoute = express.Router();

layoutRoute.post("/create-layout", isAuthenticated, authorizeRoles("admin"), createLayout);
layoutRoute.put("/edit-layout", isAuthenticated, authorizeRoles("admin"), editLayout);

layoutRoute.get("/get-layout", getLayoutByType);

module.exports = layoutRoute;

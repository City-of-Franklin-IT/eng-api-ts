"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const project_1 = require("@controllers/vesting/project");
const auth_1 = require("@middleware/auth");
const router = (0, express_1.Router)();
router
    .route('/')
    .get(project_1.getProjects)
    .post(auth_1.protect, project_1.createProject);
router
    .route('/:uuid')
    .get(project_1.getProject)
    .put(auth_1.protect, project_1.updateProject)
    .delete(auth_1.protect, project_1.deleteProject);
exports.default = router;
//# sourceMappingURL=project.js.map
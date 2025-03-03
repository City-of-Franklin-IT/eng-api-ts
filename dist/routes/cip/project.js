"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const project_1 = require("@controllers/cip/project");
const auth_1 = require("@middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.protect);
router
    .route('/')
    .get(project_1.getProjects)
    .post(project_1.createProject);
router
    .route('/:uuid')
    .get(project_1.getProject)
    .put(project_1.updateProject)
    .delete(project_1.deleteProject);
exports.default = router;
//# sourceMappingURL=project.js.map
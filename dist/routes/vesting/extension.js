"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const milestoneExtension_1 = require("@controllers/vesting/milestoneExtension");
const auth_1 = require("@middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.protect);
router
    .route('/')
    .post(milestoneExtension_1.createMilestoneExtension);
router
    .route('/:uuid')
    .put(milestoneExtension_1.updateMilestoneExtension)
    .delete(milestoneExtension_1.deleteMilestoneExtension);
exports.default = router;
//# sourceMappingURL=extension.js.map
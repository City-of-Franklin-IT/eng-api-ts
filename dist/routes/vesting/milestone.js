"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const milestone_1 = require("@controllers/vesting/milestone");
const auth_1 = require("@middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.protect);
router
    .route('/')
    .post(milestone_1.createMilestone);
router
    .route('/:uuid')
    .put(milestone_1.updateMilestone);
router
    .route('/status/:uuid')
    .put(milestone_1.updateMilestoneStatus);
exports.default = router;
//# sourceMappingURL=milestone.js.map
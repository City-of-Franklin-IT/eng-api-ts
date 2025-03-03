"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const approval_1 = require("@controllers/vesting/approval");
const auth_1 = require("@middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.protect);
router
    .route('/')
    .post(approval_1.createApproval);
router
    .route('/:uuid')
    .put(approval_1.updateApproval)
    .delete(approval_1.deleteApproval);
exports.default = router;
//# sourceMappingURL=approval.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const vestingNotification_1 = require("@controllers/vesting/vestingNotification");
const auth_1 = require("@middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.protect);
router
    .route('/')
    .post(vestingNotification_1.createNotification);
router
    .route('/:uuid')
    .put(vestingNotification_1.updateNotification)
    .delete(vestingNotification_1.deleteNotification);
exports.default = router;
//# sourceMappingURL=notification.js.map
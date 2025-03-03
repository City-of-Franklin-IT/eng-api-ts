"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const followUpDates_1 = require("@controllers/stormwater/followUpDates");
const auth_1 = require("@middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.protect);
router
    .route('/')
    .post(followUpDates_1.createFollowUpDate);
router
    .route('/:uuid')
    .put(followUpDates_1.updateFollowUpDate)
    .delete(followUpDates_1.deleteFollowUpDate);
exports.default = router;
//# sourceMappingURL=followup.js.map
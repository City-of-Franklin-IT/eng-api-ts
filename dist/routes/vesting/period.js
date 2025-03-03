"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const vestingPeriod_1 = require("@controllers/vesting/vestingPeriod");
const auth_1 = require("@middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.protect);
router
    .route('/')
    .post(vestingPeriod_1.createVestingPeriod);
router
    .route('/:uuid')
    .put(vestingPeriod_1.updatePeriod)
    .delete(vestingPeriod_1.deleteVestingPeriod);
router
    .route('/status/:uuid')
    .put(vestingPeriod_1.updateVestingStatus);
exports.default = router;
//# sourceMappingURL=period.js.map
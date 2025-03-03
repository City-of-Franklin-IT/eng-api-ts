"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const vestingExtension_1 = require("@controllers/vesting/vestingExtension");
const auth_1 = require("@middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.protect);
router
    .route('/')
    .post(vestingExtension_1.createVestingExtension);
router
    .route('/:uuid')
    .put(vestingExtension_1.updateVestingExtension)
    .delete(vestingExtension_1.deleteVestingExtension);
exports.default = router;
//# sourceMappingURL=vesting-extension.js.map
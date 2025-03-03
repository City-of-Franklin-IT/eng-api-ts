"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const resolution_1 = require("@controllers/vesting/resolution");
const auth_1 = require("@middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.protect);
router
    .route('/')
    .post(resolution_1.createResolution);
router
    .route('/:uuid')
    .put(resolution_1.updateResolution);
exports.default = router;
//# sourceMappingURL=resolution.js.map
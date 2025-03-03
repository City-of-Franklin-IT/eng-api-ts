"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const phase_1 = require("@controllers/cip/phase");
const auth_1 = require("@middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.protect);
router
    .route('/')
    .post(phase_1.createPhase);
router
    .route('/:uuid')
    .delete(phase_1.deletePhase);
exports.default = router;
//# sourceMappingURL=phase.js.map
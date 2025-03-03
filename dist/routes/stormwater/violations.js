"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const constructionViolations_1 = require("@controllers/stormwater/constructionViolations");
const auth_1 = require("@middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.protect);
router
    .route('/')
    .get(constructionViolations_1.getViolations)
    .post(constructionViolations_1.createViolation);
router
    .route('/:uuid')
    .get(constructionViolations_1.getViolation)
    .put(constructionViolations_1.updateViolation)
    .delete(constructionViolations_1.deleteViolation);
exports.default = router;
//# sourceMappingURL=violations.js.map
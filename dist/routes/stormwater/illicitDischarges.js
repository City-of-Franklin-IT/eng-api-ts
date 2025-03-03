"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const illicitDischarges_1 = require("@controllers/stormwater/illicitDischarges");
const auth_1 = require("@middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.protect);
router
    .route('/')
    .get(illicitDischarges_1.getIllicitDischarges)
    .post(illicitDischarges_1.createIllicitDischarge);
router
    .route('/:uuid')
    .get(illicitDischarges_1.getIllicitDischarge)
    .put(illicitDischarges_1.updateIllicitDischarge)
    .delete(illicitDischarges_1.deleteIllicitDischarge);
exports.default = router;
//# sourceMappingURL=illicitDischarges.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const greenInfrastructure_1 = require("@controllers/stormwater/greenInfrastructure");
const auth_1 = require("@middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.protect);
router
    .route('/')
    .get(greenInfrastructure_1.getGreenInfrastructures)
    .post(greenInfrastructure_1.createGreenInfrastructure);
router
    .route('/:uuid')
    .get(greenInfrastructure_1.getGreenInfrastructure)
    .put(greenInfrastructure_1.updateGreenInfrastructure)
    .delete(greenInfrastructure_1.deleteGreenInfrastructure);
exports.default = router;
//# sourceMappingURL=greenInfrastructure.js.map
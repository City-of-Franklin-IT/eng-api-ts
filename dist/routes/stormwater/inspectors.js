"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const inspectors_1 = require("@controllers/stormwater/inspectors");
const auth_1 = require("@middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.protect);
router
    .route('/')
    .get(inspectors_1.getInspectors)
    .post(inspectors_1.createInspector);
router
    .route('/:inspectorid')
    .get(inspectors_1.getInspector)
    .put(inspectors_1.updateInspector)
    .delete(inspectors_1.deleteInspector);
exports.default = router;
//# sourceMappingURL=inspectors.js.map
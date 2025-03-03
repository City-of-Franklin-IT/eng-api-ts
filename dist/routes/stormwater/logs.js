"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const logs_1 = require("@controllers/stormwater/logs");
const auth_1 = require("@middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.protect);
router
    .route('/')
    .post(logs_1.createLog);
router
    .route('/:uuid')
    .get(logs_1.getLog)
    .put(logs_1.updateLog)
    .delete(logs_1.deleteLog);
exports.default = router;
//# sourceMappingURL=logs.js.map
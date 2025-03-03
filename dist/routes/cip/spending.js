"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const spending_1 = require("@controllers/cip/spending");
const auth_1 = require("@middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.protect);
router
    .route('/')
    .post(spending_1.createSpending);
router
    .route('/:uuid')
    .delete(spending_1.deleteSpending);
exports.default = router;
//# sourceMappingURL=spending.js.map
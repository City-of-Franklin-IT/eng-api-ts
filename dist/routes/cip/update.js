"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const update_1 = require("@controllers/cip/update");
const auth_1 = require("@middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.protect);
router
    .route('/')
    .post(update_1.createUpdate);
router
    .route('/:uuid')
    .put(update_1.updateUpdate)
    .delete(update_1.deleteUpdate);
exports.default = router;
//# sourceMappingURL=update.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const response_1 = require("@controllers/traffic-calming/response");
const router = (0, express_1.Router)();
router
    .route('/')
    .post(response_1.createResponse);
exports.default = router;
//# sourceMappingURL=response.js.map
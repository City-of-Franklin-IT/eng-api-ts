"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const public_1 = require("@controllers/cip/public");
const sites_1 = require("@controllers/stormwater/sites");
const router = (0, express_1.Router)();
router
    .route('/active-projects')
    .get(public_1.getProjects);
router
    .route('/active-sites')
    .get(sites_1.getActiveSites);
exports.default = router;
//# sourceMappingURL=index.js.map
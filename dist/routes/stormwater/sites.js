"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sites_1 = require("@controllers/stormwater/sites");
const auth_1 = require("@middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.protect);
router
    .route('/')
    .get(sites_1.getSites)
    .post(sites_1.createSite);
router
    .route('/:uuid')
    .get(sites_1.getSite)
    .put(sites_1.updateSite)
    .delete(sites_1.deleteSite);
exports.default = router;
//# sourceMappingURL=sites.js.map
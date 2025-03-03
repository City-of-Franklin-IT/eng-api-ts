"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const siteContacts_1 = require("@controllers/stormwater/siteContacts");
const auth_1 = require("@middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.protect);
router
    .route('/')
    .post(siteContacts_1.createSiteContact);
router
    .route('/site/:siteid')
    .delete(siteContacts_1.deleteSiteContacts);
exports.default = router;
//# sourceMappingURL=siteContacts.js.map
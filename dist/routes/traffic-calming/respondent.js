"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const respondent_1 = require("@controllers/traffic-calming/respondent");
const auth_1 = require("@middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.protect);
router
    .route('/')
    .post(auth_1.protect, respondent_1.createRespondents);
router
    .route('/:uuid')
    .put(respondent_1.updateRespondent)
    .delete(auth_1.protect, respondent_1.deleteRespondent);
router
    .route('/petition/:uuid')
    .get(auth_1.protect, respondent_1.getRespondents);
router
    .route('/id/:shortid')
    .get(respondent_1.verifyRespondent);
router
    .route('/template')
    .post(respondent_1.downloadTemplate);
router
    .route('/search')
    .post(auth_1.protect, respondent_1.getRespondentsByADDRKEY);
exports.default = router;
//# sourceMappingURL=respondent.js.map
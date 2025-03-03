"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const complaints_1 = require("@controllers/stormwater/complaints");
const auth_1 = require("@middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.protect);
router
    .route('/')
    .get(complaints_1.getComplaints)
    .post(complaints_1.createComplaint);
router
    .route('/:uuid')
    .get(complaints_1.getComplaint)
    .put(complaints_1.updateComplaint)
    .delete(complaints_1.deleteComplaint);
exports.default = router;
//# sourceMappingURL=complaints.js.map
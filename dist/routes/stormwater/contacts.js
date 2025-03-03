"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const contacts_1 = require("@controllers/stormwater/contacts");
const auth_1 = require("@middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.protect);
router
    .route('/')
    .get(contacts_1.getContacts)
    .post(contacts_1.createContact);
router
    .route('/:uuid')
    .get(contacts_1.getContact)
    .put(contacts_1.updateContact)
    .delete(contacts_1.deleteContact);
exports.default = router;
//# sourceMappingURL=contacts.js.map
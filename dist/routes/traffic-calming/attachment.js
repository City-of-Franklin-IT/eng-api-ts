"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const attachment_1 = require("@controllers/traffic-calming/attachment");
const auth_1 = require("@middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.protect);
router
    .route('/')
    .post(auth_1.protect, (0, multer_1.default)().single('file'), attachment_1.createAttachment);
router
    .route('/:uuid')
    .get(attachment_1.getAttachment)
    .delete(auth_1.protect, attachment_1.deleteAttachment);
exports.default = router;
//# sourceMappingURL=attachment.js.map
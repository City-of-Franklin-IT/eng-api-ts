"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sharp_1 = __importDefault(require("sharp"));
const errorResponse_1 = require("@utils/errorResponse");
exports.default = async (file, parentId, model, email, next) => {
    (0, sharp_1.default)(file.buffer)
        .resize(960, 640, {
        fit: 'inside'
    })
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toBuffer(async (err, buffer, info) => {
        if (err) {
            return next(new errorResponse_1.ErrorResponse("Unable to upload image", 500));
        }
        const image = await model.create({
            parentId,
            fileType: 'jpeg',
            data: buffer,
            createdBy: email,
            updatedBy: email
        });
        if (!image) {
            return next(new errorResponse_1.ErrorResponse("Unable to upload image", 500));
        }
    });
};
//# sourceMappingURL=index.js.map
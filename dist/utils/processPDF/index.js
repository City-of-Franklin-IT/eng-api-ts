"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorResponse_1 = require("@utils/errorResponse");
exports.default = async (file, parentId, model, email, next) => {
    const attachment = await model.create({
        parentId,
        fileType: 'pdf',
        data: file.buffer,
        createdBy: email,
        updatedBy: email
    });
    if (!attachment) {
        return next(new errorResponse_1.ErrorResponse("Unable to upload pdf", 500));
    }
};
//# sourceMappingURL=index.js.map
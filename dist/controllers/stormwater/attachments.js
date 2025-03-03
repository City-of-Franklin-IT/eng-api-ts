"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAttachment = exports.getAttachment = exports.createAttachment = void 0;
const async_1 = __importDefault(require("@middleware/async"));
const errorResponse_1 = require("@utils/errorResponse");
const stormwater_1 = require("@models/stormwater");
const processImage_1 = __importDefault(require("@utils/processImage"));
const processPDF_1 = __importDefault(require("@utils/processPDF"));
// @desc    Create attachment
// @route   POST /api/v1/eng/stormwater/attachments
// @access  Private
exports.createAttachment = (0, async_1.default)(async (req, res, next) => {
    const { files } = req;
    const { parentId } = req.body;
    const email = req.user?.email;
    if (!files?.length) {
        return next(new errorResponse_1.ErrorResponse('No files found', 500));
    }
    if (files instanceof Array) {
        files.map(async (file) => {
            if (file.mimetype.split('/')[0] === 'image') {
                await (0, processImage_1.default)(file, parentId, stormwater_1.Attachment, email, next);
            }
            else
                await (0, processPDF_1.default)(file, parentId, stormwater_1.Attachment, email, next);
        });
    }
    res.status(201).json({
        success: true,
        msg: "Files Uploaded"
    });
});
// @desc    Download attachment
// @route   POST /api/v1/eng/stormwater/attachments/:uuid
// @access  Private
exports.getAttachment = (0, async_1.default)(async (req, res, next) => {
    const attachment = await stormwater_1.Attachment.findOne({
        where: {
            uuid: req.params.uuid
        }
    });
    if (!attachment) {
        return next(new errorResponse_1.ErrorResponse(`Unable to download attachment by uuid ${req.params.uuid}`, 500));
    }
    return res.status(200).json({
        success: true,
        data: attachment
    });
});
// @desc    Delete attachment
// @route   DELETE /api/v1/eng/stormwater/attachments/:uuid
// @access  Private
exports.deleteAttachment = (0, async_1.default)(async (req, res, next) => {
    const result = await stormwater_1.Attachment.destroy({
        where: {
            uuid: req.params.uuid
        }
    });
    if (result === 0) {
        return next(new errorResponse_1.ErrorResponse(`Unable to delete attachment by uuid ${req.params.uuid}`, 500));
    }
    res.status(200).json({
        success: true,
        msg: "Attachment Deleted"
    });
});
//# sourceMappingURL=attachments.js.map
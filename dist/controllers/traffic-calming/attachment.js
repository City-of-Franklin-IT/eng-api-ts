"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAttachment = exports.getAttachment = exports.createAttachment = void 0;
const async_1 = __importDefault(require("@middleware/async"));
const errorResponse_1 = require("@utils/errorResponse");
const processImage_1 = __importDefault(require("@utils/processImage"));
const processPDF_1 = __importDefault(require("@utils/processPDF"));
const traffic_calming_1 = require("@models/traffic-calming");
const determineFileType_1 = __importDefault(require("@utils/determineFileType"));
//@desc    Upload attachment
//@route   POST /api/v1/eng/traffic-calming/attachment
//@access  Private
exports.createAttachment = (0, async_1.default)(async (req, res, next) => {
    const { file } = req;
    const { parentId } = req.body;
    const email = req.user?.email;
    const fileType = (0, determineFileType_1.default)(file?.buffer);
    if (fileType.type === 'image') {
        await (0, processImage_1.default)(file, parentId, traffic_calming_1.Attachment, email, next); // Image
    }
    else
        await (0, processPDF_1.default)(file, parentId, traffic_calming_1.Attachment, email, next); // PDF
    res.status(201).json({
        success: true,
        msg: "File Uploaded"
    });
});
// @desc    Download attachment
// @route   GET /api/v1/eng/traffic-calming/attachment/:uuid
// @access  Private
exports.getAttachment = (0, async_1.default)(async (req, res, next) => {
    const attachment = await traffic_calming_1.Attachment.findOne({
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
// @route   DELETE /api/v1/eng/traffic-calming/attachments/:uuid
// @access  Private
exports.deleteAttachment = (0, async_1.default)(async (req, res, next) => {
    const result = await traffic_calming_1.Attachment.destroy({
        where: {
            uuid: req.params.uuid
        }
    });
    if (result === 0) {
        return next(new errorResponse_1.ErrorResponse(`Could not delete attachment by uuid ${req.params.uuid}`, 500));
    }
    res.status(200).json({
        success: true,
        msg: "Attachment Deleted"
    });
});
//# sourceMappingURL=attachment.js.map
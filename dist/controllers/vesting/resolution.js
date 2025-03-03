"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateResolution = exports.createResolution = void 0;
const async_1 = __importDefault(require("@middleware/async"));
const errorResponse_1 = require("@utils/errorResponse");
const vesting_1 = require("@models/vesting");
//@desc    Create resolution
//@route   POST /api/v1/eng/vesting/resolution
//@access  Private
exports.createResolution = (0, async_1.default)(async (req, res, next) => {
    const { resolution, parentId } = req.body;
    const email = req.user?.email;
    const result = await vesting_1.Resolution.create({
        resolution,
        parentId,
        createdBy: email,
        updatedBy: email
    });
    if (!result) {
        return next(new errorResponse_1.ErrorResponse('Could not create resolution', 500));
    }
    res.status(201).json({
        success: true,
        msg: 'Resolution Created'
    });
});
//@desc    Update resolution
//@route   PUT /api/v1/eng/vesting/resolution/:uuid
//@access  Private
exports.updateResolution = (0, async_1.default)(async (req, res, next) => {
    const { resolution } = req.body;
    const email = req.user?.email;
    const result = await vesting_1.Resolution.update({
        resolution,
        updatedBy: email
    }, {
        where: {
            uuid: req.params.uuid
        }
    });
    const [affectedCount] = result;
    if (affectedCount === 0) {
        return next(new errorResponse_1.ErrorResponse(`Could not update resolution by uuid ${req.params.uuid}`, 500));
    }
    res.status(200).json({
        success: true,
        msg: "Resolution Updated"
    });
});
//# sourceMappingURL=resolution.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteVestingExtension = exports.updateVestingExtension = exports.createVestingExtension = void 0;
const async_1 = __importDefault(require("@middleware/async"));
const errorResponse_1 = require("@utils/errorResponse");
const vesting_1 = require("@models/vesting");
//@desc    Create vesting extension
//@route   POST /api/v1/eng/vesting/vesting-extension
//@access  Private
exports.createVestingExtension = (0, async_1.default)(async (req, res, next) => {
    const { date, parentId } = req.body;
    const email = req.user?.email;
    const extension = await vesting_1.VestingExtension.create({
        date,
        parentId,
        createdBy: email,
        updatedBy: email
    });
    if (!extension) {
        return next(new errorResponse_1.ErrorResponse('Could not create vesting extension', 500));
    }
    res.status(201).json({
        success: true,
        msg: 'Vesting Extension Created'
    });
});
//@desc    Update vesting extension
//@route   PUT /api/v1/eng/vesting/vesting-extension/:uuid
//@access  Private
exports.updateVestingExtension = (0, async_1.default)(async (req, res, next) => {
    const { date } = req.body;
    const email = req.user?.email;
    const extension = await vesting_1.VestingExtension.update({
        date,
        updatedBy: email
    }, {
        where: {
            uuid: req.params.uuid
        },
        returning: true
    });
    const [affectedCount, affectedRows] = extension;
    if (affectedCount === 0) {
        return next(new errorResponse_1.ErrorResponse(`Unable to update vesting extension by uuid ${req.params.uuid}`, 500));
    }
    const data = affectedRows[0];
    res.status(200).json({
        success: true,
        msg: "Vesting Extension Updated",
        data
    });
});
//@desc    Delete vesting extension
//@route   DELETE /api/v1/eng/vesting/vesting-extension/:uuid
//@access  Private
exports.deleteVestingExtension = (0, async_1.default)(async (req, res, next) => {
    const result = await vesting_1.VestingExtension.destroy({
        where: {
            uuid: req.params.uuid
        }
    });
    if (result === 0) {
        return next(new errorResponse_1.ErrorResponse(`Unable to delete vesting extension by uuid ${req.params.uuid}`, 500));
    }
    res.status(200).json({
        success: true,
        msg: 'Vesting Extension Deleted'
    });
});
//# sourceMappingURL=vestingExtension.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateVestingStatus = exports.updatePeriod = exports.deleteVestingPeriod = exports.createVestingPeriod = void 0;
const async_1 = __importDefault(require("@middleware/async"));
const errorResponse_1 = require("@utils/errorResponse");
const vesting_1 = require("@models/vesting");
//@desc    Create vesting period
//@route   POST /api/v1/eng/vesting/period
//@access  Private
exports.createVestingPeriod = (0, async_1.default)(async (req, res, next) => {
    const { type, date, parentId } = req.body;
    const email = req.user?.email;
    const result = await vesting_1.VestingPeriod.create({
        type,
        date,
        parentId,
        createdBy: email,
        updatedBy: email
    });
    if (!result) {
        return next(new errorResponse_1.ErrorResponse('Unable to create new vesting period', 500));
    }
    const { uuid } = result;
    const newStatus = await vesting_1.VestingStatus.create({
        parentId: uuid,
        createdBy: email,
        updatedBy: email
    });
    if (!newStatus) {
        return next(new errorResponse_1.ErrorResponse('Unable to create new vesting status', 500));
    }
    res.status(201).json({
        success: true,
        msg: "Vesting Period Created"
    });
});
//@desc    Delete vesting period
//@route   DELETE /api/v1/eng/vesting/period/:uuid
//@access  Private
exports.deleteVestingPeriod = (0, async_1.default)(async (req, res, next) => {
    const result = await vesting_1.VestingPeriod.destroy({
        where: {
            uuid: req.params.uuid
        }
    });
    if (result === 0) {
        return next(new errorResponse_1.ErrorResponse(`Unable to delete vesting period by uuid ${req.params.uuid}`, 500));
    }
    res.status(200).json({
        success: true,
        msg: "Vesting Period Deleted"
    });
});
//@desc    Update vesting period
//@route   PUT /api/v1/eng/vesting/period/:uuid
//@access  Private
exports.updatePeriod = (0, async_1.default)(async (req, res, next) => {
    const { type, date } = req.body;
    const email = req.user?.email;
    const result = await vesting_1.VestingPeriod.update({
        type,
        date,
        updatedBy: email
    }, {
        where: {
            uuid: req.params.uuid
        }
    });
    const [affectedCount] = result;
    if (affectedCount === 0) {
        return next(new errorResponse_1.ErrorResponse(`Unable to update vesting period by uuid ${req.params.uuid}`, 500));
    }
    res.status(200).json({
        success: true,
        msg: "Vesting Period Updated"
    });
});
//@desc    Update vesting status
//@route   PUT /api/v1/eng/vesting/period/status/:uuid
//@access  Private
exports.updateVestingStatus = (0, async_1.default)(async (req, res, next) => {
    const { achieved, expired } = req.body;
    const email = req.user?.email;
    const status = await vesting_1.VestingStatus.update({
        achieved,
        expired,
        updatedBy: email
    }, {
        where: {
            uuid: req.params.uuid
        }
    });
    const [affectedCount] = status;
    if (affectedCount === 0) {
        return next(new errorResponse_1.ErrorResponse(`Unable to update project vesting status by uuid ${req.params.uuid}`, 500));
    }
    res.status(200).json({
        success: true,
        msg: "Vesting Status Updated"
    });
});
//# sourceMappingURL=vestingPeriod.js.map
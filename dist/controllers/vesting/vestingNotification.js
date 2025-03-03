"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNotification = exports.updateNotification = exports.createNotification = void 0;
const async_1 = __importDefault(require("@middleware/async"));
const errorResponse_1 = require("@utils/errorResponse");
const vesting_1 = require("@models/vesting");
//@desc    Create notification
//@route   POST /api/v1/eng/vesting/notification
//@access  Private
exports.createNotification = (0, async_1.default)(async (req, res, next) => {
    const { date, type, parentId } = req.body;
    const email = req.user?.email;
    const notification = await vesting_1.VestingNotification.create({
        date,
        type,
        parentId,
        createdBy: email,
        updatedBy: email
    });
    if (!notification) {
        return next(new errorResponse_1.ErrorResponse('Unable to create notification', 500));
    }
    res.status(201).json({
        success: true,
        msg: 'Notification Created'
    });
});
//@desc    Update notification
//@route   PUT /api/v1/eng/vesting/notification/:uuid
//@access  Private
exports.updateNotification = (0, async_1.default)(async (req, res, next) => {
    const { date } = req.body;
    const email = req.user?.email;
    const notification = await vesting_1.VestingNotification.update({
        date,
        updatedBy: email
    }, {
        where: {
            uuid: req.params.uuid
        }
    });
    const [affectedCount] = notification;
    if (affectedCount === 0) {
        return next(new errorResponse_1.ErrorResponse(`Unable to update notification by uuid ${req.params.uuid}`, 500));
    }
    res.status(200).json({
        success: true,
        msg: 'Notification Updated'
    });
});
//@desc    Delete notification
//@route   DELETE /api/v1/eng/vesting/notification/:uuid
//@access  Private
exports.deleteNotification = (0, async_1.default)(async (req, res, next) => {
    const result = await vesting_1.VestingNotification.destroy({
        where: {
            uuid: req.params.uuid
        }
    });
    if (result === 0) {
        return next(new errorResponse_1.ErrorResponse(`Unable to delete notification by uuid ${req.params.uuid}`, 500));
    }
    res.status(200).json({
        success: true,
        msg: 'Notification Deleted'
    });
});
//# sourceMappingURL=vestingNotification.js.map
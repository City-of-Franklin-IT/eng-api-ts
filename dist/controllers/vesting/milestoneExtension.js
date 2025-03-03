"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMilestoneExtension = exports.updateMilestoneExtension = exports.createMilestoneExtension = void 0;
const async_1 = __importDefault(require("@middleware/async"));
const errorResponse_1 = require("@utils/errorResponse");
const vesting_1 = require("@models/vesting");
//@desc    Create extension
//@route   POST /api/v1/eng/vesting/extension
//@access  Private
exports.createMilestoneExtension = (0, async_1.default)(async (req, res, next) => {
    const { date, parentId } = req.body;
    const email = req.user?.email;
    const extension = await vesting_1.MilestoneExtension.create({
        date,
        parentId,
        createdBy: email,
        updatedBy: email
    });
    if (!extension) {
        return next(new errorResponse_1.ErrorResponse('Could not create milestone extension', 500));
    }
    res.status(201).json({
        success: true,
        msg: 'Milestone Extension Created'
    });
});
//@desc    Update extension
//@route   PUT /api/v1/eng/vesting/extension/:uuid
//@access  Private
exports.updateMilestoneExtension = (0, async_1.default)(async (req, res, next) => {
    const { date } = req.body;
    const email = req.user?.email;
    const extension = await vesting_1.MilestoneExtension.update({
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
        return next(new errorResponse_1.ErrorResponse(`Unable to update milestone extension by uuid ${req.params.uuid}`, 500));
    }
    const data = affectedRows[0];
    res.status(200).json({
        success: true,
        msg: "Milestone Extension Updated",
        data
    });
});
//@desc    Delete extension
//@route   DELETE /api/v1/eng/vesting/extension/:uuid
//@access  Private
exports.deleteMilestoneExtension = (0, async_1.default)(async (req, res, next) => {
    const result = await vesting_1.MilestoneExtension.destroy({
        where: {
            uuid: req.params.uuid
        }
    });
    if (result === 0) {
        return next(new errorResponse_1.ErrorResponse(`Unable to delete milestone extension by uuid ${req.params.uuid}`, 500));
    }
    res.status(200).json({
        success: true,
        msg: 'Milestone Extension Deleted'
    });
});
//# sourceMappingURL=milestoneExtension.js.map
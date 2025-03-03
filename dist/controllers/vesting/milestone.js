"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMilestoneStatus = exports.updateMilestone = exports.createMilestone = void 0;
const async_1 = __importDefault(require("@middleware/async"));
const errorResponse_1 = require("@utils/errorResponse");
const vesting_1 = require("@models/vesting");
//@desc    Create milestone
//@route   POST /api/v1/eng/vesting/milestone
//@access  Private
exports.createMilestone = (0, async_1.default)(async (req, res, next) => {
    const { number, date, parentId } = req.body;
    const email = req.user?.email;
    const milestone = await vesting_1.Milestone.create({
        number,
        date,
        parentId,
        createdBy: email,
        updatedBy: email
    });
    if (!milestone) {
        return next(new errorResponse_1.ErrorResponse('Could not create new milestone', 500));
    }
    const { uuid } = milestone;
    await vesting_1.MilestoneStatus.create({
        parentId: uuid,
        createdBy: email,
        updatedBy: email
    });
    res.status(201).json({
        success: true,
        msg: 'Milestone Created'
    });
});
//@desc    Update milestone
//@route   PUT /api/v1/eng/vesting/milestone/:uuid
//@access  Private
exports.updateMilestone = (0, async_1.default)(async (req, res, next) => {
    const { date } = req.body;
    const email = req.user?.email;
    const milestone = await vesting_1.Milestone.update({
        date,
        updatedBy: email
    }, {
        where: {
            uuid: req.params.uuid
        }
    });
    const [affectedCount] = milestone;
    if (affectedCount === 0) {
        return next(new errorResponse_1.ErrorResponse(`Unable to update milestone by uuid ${req.params.uuid}`, 500));
    }
    res.status(200).json({
        success: true,
        msg: "Milestone Updated"
    });
});
//@desc    Update milestone status
//@route   PUT /api/v1/eng/vesting/milestone/status/:uuid
//@access  Private
exports.updateMilestoneStatus = (0, async_1.default)(async (req, res, next) => {
    const { achieved, expired } = req.body;
    const email = req.user?.email;
    const status = await vesting_1.MilestoneStatus.update({
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
        return next(new errorResponse_1.ErrorResponse(`Unable to update milestone status by uuid ${req.params.uuid}`, 500));
    }
    res.status(200).json({
        success: true,
        msg: "Milestone Status Updated"
    });
});
//# sourceMappingURL=milestone.js.map
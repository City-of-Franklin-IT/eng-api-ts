"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteApproval = exports.updateApproval = exports.createApproval = void 0;
const async_1 = __importDefault(require("@middleware/async"));
const errorResponse_1 = require("@utils/errorResponse");
const vesting_1 = require("@models/vesting");
//@desc    Create project approval
//@route   POST /api/v1/eng/vesting/approval
//@access  Private
exports.createApproval = (0, async_1.default)(async (req, res, next) => {
    const { date, approvedBy, parentId } = req.body;
    const email = req.user?.email;
    const approval = await vesting_1.Approval.create({
        date,
        approvedBy,
        parentId,
        createdBy: email,
        updatedBy: email
    });
    if (!approval) {
        return next(new errorResponse_1.ErrorResponse(`Could not create new project approval`, 500));
    }
    res.status(201).json({
        success: true,
        msg: "Project Approval Created"
    });
});
//@desc    Update project approval
//@route   PUT /api/v1/eng/vesting/approval/:uuid
//@access  Private
exports.updateApproval = (0, async_1.default)(async (req, res, next) => {
    const { date, approvedBy } = req.body;
    const email = req.user?.email;
    const approval = await vesting_1.Approval.update({
        date,
        approvedBy,
        updatedBy: email
    }, {
        where: {
            uuid: req.params.uuid
        }
    });
    if (!approval) {
        return next(new errorResponse_1.ErrorResponse(`Unable to update approval by uuid ${req.params.uuid}`, 500));
    }
    res.status(200).json({
        success: true,
        msg: "Project Approval Updated"
    });
});
//@desc    Delete project approval
//@route   DELTE /api/v1/eng/vesting/approval/:uuid
//@access  Private
exports.deleteApproval = (0, async_1.default)(async (req, res, next) => {
    const result = await vesting_1.Approval.destroy({
        where: {
            uuid: req.params.uuid
        }
    });
    if (result === 0) {
        return next(new errorResponse_1.ErrorResponse(`Unable to delete approval by uuid ${req.params.uuid}`, 500));
    }
    res.status(200).json({
        success: true,
        msg: "Project Approval Deleted"
    });
});
//# sourceMappingURL=approval.js.map
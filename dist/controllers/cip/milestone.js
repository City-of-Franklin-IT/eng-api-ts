"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMilestone = exports.updateMilestone = exports.createMilestone = void 0;
const async_1 = __importDefault(require("@middleware/async"));
const errorResponse_1 = require("@utils/errorResponse");
const cip_1 = require("@models/cip");
//@desc    Create new project milestone
//@route   POST /api/v1/eng/cip/milestones
//@access  Private
exports.createMilestone = (0, async_1.default)(async (req, res, next) => {
    const { milestoneDesc, milestoneEst, milestoneRealized, parentId } = req.body;
    const email = req.user?.email;
    const milestone = await cip_1.Milestone.create({
        milestoneDesc,
        milestoneEst: milestoneEst ? new Date(milestoneEst) : null,
        milestoneRealized: milestoneRealized ? new Date(milestoneRealized) : null,
        parentId,
        createdBy: email,
        updatedBy: email
    });
    if (!milestone) {
        return next(new errorResponse_1.ErrorResponse('Could not create new milestone', 500));
    }
    res.status(201).json({
        success: true,
        msg: "Milestone Created"
    });
});
//@desc    Update project milestone
//@route   PUT /api/v1/eng/cip/milestones/:uuid
//@access  Private
exports.updateMilestone = (0, async_1.default)(async (req, res, next) => {
    const { milestoneDesc, milestoneEst, milestoneRealized } = req.body;
    const milestone = await cip_1.Milestone.update({
        milestoneDesc,
        milestoneEst: milestoneEst ? new Date(milestoneEst) : null,
        milestoneRealized: milestoneRealized ? new Date(milestoneRealized) : null,
        updatedBy: req.user?.email
    }, {
        where: {
            uuid: req.params.uuid
        }
    });
    if (!milestone) {
        return next(new errorResponse_1.ErrorResponse(`Could not update milestone with uuid ${req.params.uuid}`, 500));
    }
    res.status(200).json({
        success: true,
        msg: "Milestone Updated"
    });
});
//@desc    Delete project milestone
//@route   DELETE /api/v1/eng/cip/milestones/:uuid
//@access  Private
exports.deleteMilestone = (0, async_1.default)(async (req, res, next) => {
    await cip_1.Milestone.destroy({
        where: {
            uuid: req.params.uuid
        }
    });
    res.status(200).json({
        success: true,
        msg: "Milestone Deleted"
    });
});
//# sourceMappingURL=milestone.js.map
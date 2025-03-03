"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjects = void 0;
const async_1 = __importDefault(require("@middleware/async"));
const errorResponse_1 = require("@utils/errorResponse");
const cip_1 = require("@models/cip");
//@desc    Get CIP projects
//@route   GET /api/v1/eng/public/cip-projects
//@access  Public
exports.getProjects = (0, async_1.default)(async (req, res, next) => {
    const projects = await cip_1.Project.findAll({
        where: {
            archived: false
        },
        attributes: ['projectId', 'name', 'projectDescription', 'type', 'manager', 'link', 'approvedBudget', 'xCoordinate', 'yCoordinate', 'uuid'],
        order: [['name', 'asc'], [cip_1.Milestone, 'milestoneEst', 'asc'], [cip_1.Phase, 'createdAt', 'desc'], [cip_1.Update, 'createdAt', 'desc'], [{ model: cip_1.Spending, as: 'Spending' }, 'dollarsSpentDate', 'desc']],
        include: [
            { model: cip_1.Milestone, attributes: ['milestoneDesc', 'milestoneEst', 'milestoneRealized', 'parentId', 'uuid'] },
            { model: cip_1.Phase, attributes: ['phase', 'parentId', 'uuid', 'createdAt'] },
            { model: cip_1.Update, attributes: ['projectUpdate', 'parentId', 'uuid', 'createdAt'] },
            { model: cip_1.Spending, as: 'Spending', attributes: ['dollarsSpent', 'dollarsSpentDate', 'uuid', 'createdAt']
            }
        ]
    });
    if (!projects) {
        return next(new errorResponse_1.ErrorResponse("Could not return CIP projects", 500));
    }
    res.status(200).json({
        success: true,
        data: projects
    });
});
//# sourceMappingURL=public.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProject = exports.updateProject = exports.createProject = exports.getProject = exports.getProjects = void 0;
const async_1 = __importDefault(require("@middleware/async"));
const errorResponse_1 = require("@utils/errorResponse");
const vesting_1 = require("@models/vesting");
//@desc    Get projects
//@route   GET /api/v1/eng/vesting/project
//@access  Private
exports.getProjects = (0, async_1.default)(async (req, res, next) => {
    const projects = await vesting_1.Project.findAll({
        order: [
            [vesting_1.Milestone, 'number', 'asc'],
            [vesting_1.Milestone, 'date', 'asc'],
            ['name', 'asc'],
            [vesting_1.VestingNotification, 'date', 'desc']
        ],
        include: [
            { model: vesting_1.Approval },
            { model: vesting_1.Resolution },
            { model: vesting_1.Milestone,
                include: [
                    { model: vesting_1.MilestoneExtension },
                    { model: vesting_1.MilestoneStatus }
                ]
            },
            { model: vesting_1.VestingPeriod,
                include: [
                    { model: vesting_1.VestingExtension },
                    { model: vesting_1.VestingStatus }
                ]
            },
            { model: vesting_1.VestingNotification },
        ]
    });
    res.status(200).json({
        success: true,
        data: projects
    });
});
//@desc    Get project
//@route   GET /api/v1/eng/vesting/project/:uuid
//@access  Private
exports.getProject = (0, async_1.default)(async (req, res, next) => {
    const project = await vesting_1.Project.findOne({
        where: {
            uuid: req.params.uuid
        },
        order: [
            [vesting_1.Milestone, 'number', 'asc'],
            [vesting_1.Milestone, 'date', 'asc'],
            ['name', 'asc'],
            [vesting_1.VestingNotification, 'date', 'desc']
        ],
        include: [
            { model: vesting_1.Approval },
            { model: vesting_1.Resolution },
            { model: vesting_1.Milestone,
                include: [
                    { model: vesting_1.MilestoneExtension },
                    { model: vesting_1.MilestoneStatus }
                ]
            },
            { model: vesting_1.VestingPeriod,
                include: [
                    { model: vesting_1.VestingExtension },
                    { model: vesting_1.VestingStatus }
                ]
            },
            { model: vesting_1.VestingNotification },
        ]
    });
    if (!project) {
        return next(new errorResponse_1.ErrorResponse(`Unable to return project by uuid ${req.params.uuid}`, 500));
    }
    res.status(200).json({
        success: true,
        data: project
    });
});
//@desc    Create project
//@route   POST /api/v1/eng/vesting/project
//@access  Private
exports.createProject = (0, async_1.default)(async (req, res, next) => {
    const { type, name, cof, ordinance, notes } = req.body;
    const email = req.user?.email;
    const project = await vesting_1.Project.create({
        type,
        name,
        cof,
        ordinance,
        notes,
        createdBy: email,
        updatedBy: email
    });
    if (!project) {
        return next(new errorResponse_1.ErrorResponse('Could not create new project', 500));
    }
    res.status(201).json({
        success: true,
        msg: 'Project Created',
        data: project
    });
});
//@desc    Update project
//@route   PUT /api/v1/eng/vesting/project/:uuid
//@access  Private
exports.updateProject = (0, async_1.default)(async (req, res, next) => {
    const { name, cof, ordinance, expired, notes } = req.body;
    const email = req.user?.email;
    const project = await vesting_1.Project.update({
        name,
        cof,
        ordinance,
        expired,
        notes,
        updatedBy: email
    }, {
        where: {
            uuid: req.params.uuid
        }
    });
    const [affectedCount] = project;
    if (affectedCount === 0) {
        return next(new errorResponse_1.ErrorResponse(`Unable to update project by uuid ${req.params.uuid}`, 500));
    }
    res.status(200).json({
        success: true,
        msg: 'Project Updated'
    });
});
//@desc    Delete project
//@route   DELETE /api/v1/eng/vesting/project/:uuid
//@access  Private
exports.deleteProject = (0, async_1.default)(async (req, res, next) => {
    const result = await vesting_1.Project.destroy({
        where: {
            uuid: req.params.uuid
        }
    });
    if (result === 0) {
        return next(new errorResponse_1.ErrorResponse(`Could not delete project by uuid ${req.params.uuid}`, 500));
    }
    res.status(200).json({
        success: true,
        msg: 'Project Deleted'
    });
});
//# sourceMappingURL=project.js.map
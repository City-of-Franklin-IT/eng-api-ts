"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProject = exports.updateProject = exports.createProject = exports.getProject = exports.getProjects = void 0;
const sequelize_1 = require("sequelize");
const async_1 = __importDefault(require("@middleware/async"));
const errorResponse_1 = require("@utils/errorResponse");
const cip_1 = require("@models/cip");
//@desc    Get projects
//@route   GET /api/v1/eng/cip/project
//@access  Public
exports.getProjects = (0, async_1.default)(async (req, res, next) => {
    const projects = await cip_1.Project.findAll({
        where: {
            name: { [sequelize_1.Op.ne]: '' }
        }
    });
    if (!projects.length) {
        return next(new errorResponse_1.ErrorResponse('Could not return projects', 500));
    }
    res.status(200).json({
        success: true,
        data: projects
    });
});
//@desc    Get project
//@route   GET /api/v1/eng/cip/project/:uuid
//@access  Public
exports.getProject = (0, async_1.default)(async (req, res, next) => {
    const project = await cip_1.Project.findOne({
        where: {
            uuid: req.params.uuid
        },
        include: [
            { model: cip_1.Milestone },
            { model: cip_1.Phase },
            { model: cip_1.Spending, as: 'Spending' },
            { model: cip_1.Update }
        ],
        order: [
            ['name', 'asc'],
            [cip_1.Milestone, 'milestoneEst', 'asc'],
            [cip_1.Phase, 'createdAt', 'desc'],
            [cip_1.Update, 'createdAt', 'desc'],
            [{ model: cip_1.Spending, as: 'Spending' }, 'createdAt', 'desc']
        ]
    });
    if (!project) {
        return next(new errorResponse_1.ErrorResponse(`Could not return project by uuid ${req.params.uuid}`, 500));
    }
    res.status(200).json({
        success: true,
        data: project
    });
});
//@desc    Create project
//@route   POST /api/v1/eng/cip/project
//@access  Private
exports.createProject = (0, async_1.default)(async (req, res, next) => {
    const { name, projectDescription, type, manager, managerEmail, link, approvedBudget, archived, xCoordinate, yCoordinate } = req.body;
    const email = req.user?.email;
    const project = await cip_1.Project.create({
        name,
        projectDescription,
        type,
        manager,
        managerEmail,
        link,
        approvedBudget,
        archived,
        xCoordinate,
        yCoordinate,
        createdBy: email,
        updatedBy: email
    });
    if (!project) {
        return next(new errorResponse_1.ErrorResponse('Could not create new project', 500));
    }
    await cip_1.Phase.create({
        phase: 'Design',
        parentId: project.uuid,
        createdBy: email,
        updatedBy: email
    });
    res.status(201).json({
        success: true,
        data: project,
        msg: 'Project Created'
    });
});
//@desc    Update project
//@route   PUT /api/v1/end/cip/project/:uuid
//@access  Private
exports.updateProject = (0, async_1.default)(async (req, res, next) => {
    const { name, projectDescription, type, manager, managerEmail, link, approvedBudget, archived, xCoordinate, yCoordinate } = req.body;
    const email = req.user?.email;
    const project = await cip_1.Project.update({
        name,
        projectDescription,
        type,
        manager,
        managerEmail,
        link,
        approvedBudget,
        archived,
        xCoordinate,
        yCoordinate,
        updatedBy: email
    }, {
        where: {
            uuid: req.params.uuid
        }
    });
    if (!project) {
        return next(new errorResponse_1.ErrorResponse(`Could not update project by uuid ${req.params.uuid}`, 500));
    }
    res.status(200).json({
        success: true,
        msg: "Project Updated"
    });
});
//@desc    Delete project
//@route   DELETE /api/v1/eng/cip/project/:uuid
//@access  Private
exports.deleteProject = (0, async_1.default)(async (req, res, next) => {
    await cip_1.Project.destroy({
        where: {
            uuid: req.params.uuid
        }
    });
    res.status(200).json({
        success: true,
        msg: "Project Deleted"
    });
});
//# sourceMappingURL=project.js.map
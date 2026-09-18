import { Op } from 'sequelize'
import asyncHandler from '@middleware/async'
import { ErrorResponse } from '@utils/errorResponse'
import editorTracking from '@utils/editorTracking'
import { Project, Milestone, Phase, Spending, Update } from '@models/cip'

// Types
import { Request, Response, NextFunction } from 'express'
import { Model } from 'sequelize'
import { ControllerResponse } from '@controllers/types'
import { ProjectInterface } from '@models/cip/types'
import { GetProjectsResponse, GetProjectResponse, CreateProjectRequest, CreateProjectResponse } from './types'

const excludeEditorFields = ['createdBy', 'updatedBy', 'createdAt', 'updatedAt']
const excludeEditorFieldsKeepAuthor = ['updatedBy', 'updatedAt']

//@desc    Get projects
//@route   GET /api/v2/eng/cip/project
//@access  Public
export const getProjects = asyncHandler(async (req: Request, res: Response<GetProjectsResponse>) => {
  const projects = await Project.findAll({
    where: {
      name: { [Op.ne]: '' }
    },
    order: [['name', 'asc'], [Phase, 'updatedAt', 'desc']],
    include: [
      { model: Phase, attributes: { exclude: excludeEditorFields } }
    ]
  }) as (Model<ProjectInterface> & ProjectInterface)[]

  res.status(200).json({
    success: true,
    data: projects
  })
})

//@desc    Get project
//@route   GET /api/v2/eng/cip/project/:uuid
//@access  Public
export const getProject = asyncHandler(async (req: Request<{ uuid: string }>, res: Response<GetProjectResponse>, next: NextFunction) => {
  const project = await Project.findOne({
    where: {
      uuid: req.params.uuid
    },
    include: [
      { model: Milestone, attributes: { exclude: excludeEditorFields } },
      { model: Phase, attributes: { exclude: excludeEditorFields } },
      { model: Spending, as: 'Spending', attributes: { exclude: excludeEditorFields } },
      { model: Update, attributes: { exclude: excludeEditorFieldsKeepAuthor } }],
    order:  [
      ['name', 'asc'], 
      [Milestone, 'milestoneEst', 'asc'], 
      [Phase, 'updatedAt', 'desc'], 
      [Update, 'createdAt', 'desc'], 
      [{ model: Spending, as: 'Spending'}, 'createdAt', 'desc']]
  }) as (Model<ProjectInterface> & ProjectInterface)

  if(!project) {
    return next(new ErrorResponse(`Unable to return project by uuid ${ req.params.uuid }`, 404))
  }

  res.status(200).json({
    success: true,
    data: project
  })
})

//@desc    Create project
//@route   POST /api/v2/eng/cip/project
//@access  Private
export const createProject = asyncHandler(async (req: Request<{}, {}, CreateProjectRequest>, res: Response<CreateProjectResponse>) => {
  const { name, projectDescription, type, manager, managerEmail, link, archived, xCoordinate, yCoordinate } = req.body

  const project = await Project.create({
    name,
    projectDescription,
    type,
    manager,
    managerEmail,
    link,
    approvedBudget: 0,
    archived,
    xCoordinate,
    yCoordinate,
    ...editorTracking(req)
  }) as Model<ProjectInterface> & ProjectInterface

  await Phase.create({ // Create phase for new project
    phase: 'Design',
    parentId: project.uuid,
    ...editorTracking(req)
  })

  res.status(201).json({
    success: true,
    data: project,
    msg: 'Project Created'
  })
})

//@desc    Update project
//@route   PUT /api/v2/end/cip/project/:uuid
//@access  Private
export const updateProject = asyncHandler(async (req: Request<{ uuid: string }, {}, CreateProjectRequest>, res: Response<ControllerResponse & { data: ProjectInterface }>, next: NextFunction) => {
  const { name, projectDescription, type, manager, managerEmail, link, approvedBudget, archived, xCoordinate, yCoordinate } = req.body

  const project = await Project.update({
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
    ...editorTracking(req)
  },{
    where: {
      uuid: req.params.uuid
    },
    returning: true
  })

  const [affectedCount, affectedRows] = project

  if(affectedCount === 0) {
    return next(new ErrorResponse(`Unable to update project by uuid ${ req.params.uuid }`, 404))
  }

  const data = affectedRows[0] as Model<ProjectInterface> & ProjectInterface

  res.status(200).json({
    success: true,
    msg: "Project Updated",
    data
  })
})

//@desc    Delete project
//@route   DELETE /api/v2/eng/cip/project/:uuid
//@access  Private
export const deleteProject = asyncHandler(async (req: Request<{ uuid: string }>, res: Response<ControllerResponse>, next: NextFunction) => {
  const result = await Project.destroy({
    where: {
      uuid: req.params.uuid
    }
  })

  if(result === 0) {
    return next(new ErrorResponse(`Unable to delete project by uuid ${ req.params.uuid }`, 404))
  }

  res.status(200).json({
    success: true,
    msg: "Project Deleted"
  })
})
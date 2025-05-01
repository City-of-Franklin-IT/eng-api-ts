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

//@desc    Get projects
//@route   GET /api/v1/eng/cip/project
//@access  Public
export const getProjects = asyncHandler(async (req: Request, res: Response<GetProjectsResponse>, next: NextFunction) => {
  const projects = await Project.findAll({
    where: {
      name: { [Op.ne]: '' }
    }
  }) as (Model<ProjectInterface> & ProjectInterface)[]

  res.status(200).json({
    success: true,
    data: projects
  })
})

//@desc    Get project
//@route   GET /api/v1/eng/cip/project/:uuid
//@access  Public
export const getProject = asyncHandler(async (req: Request<{ uuid: string }>, res: Response<GetProjectResponse>, next: NextFunction) => {
  const project = await Project.findOne({
    where: {
      uuid: req.params.uuid
    },
    include: [
      { model: Milestone }, 
      { model: Phase }, 
      { model: Spending, as: 'Spending' }, 
      { model: Update }],
    order:  [
      ['name', 'asc'], 
      [Milestone, 'milestoneEst', 'asc'], 
      [Phase, 'createdAt', 'desc'], 
      [Update, 'createdAt', 'desc'], 
      [{ model: Spending, as: 'Spending'}, 'createdAt', 'desc']]
  }) as (Model<ProjectInterface> & ProjectInterface)

  if(!project) {
    return next(new ErrorResponse(`Unable to return project by uuid ${ req.params.uuid }`, 500))
  }

  res.status(200).json({
    success: true,
    data: project
  })
})

//@desc    Create project
//@route   POST /api/v1/eng/cip/project
//@access  Private
export const createProject = asyncHandler(async (req: Request<{}, {}, CreateProjectRequest>, res: Response<CreateProjectResponse>, next: NextFunction) => {
  const { name, projectDescription, type, manager, managerEmail, link, approvedBudget, archived, xCoordinate, yCoordinate } = req.body

  const project = await Project.create({
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
  }) as (Model<ProjectInterface> & ProjectInterface)

  if(!project) {
    return next(new ErrorResponse('Unable to create new project', 500))
  }

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
//@route   PUT /api/v1/end/cip/project/:uuid
//@access  Private
export const updateProject = asyncHandler(async (req: Request<{ uuid: string }, {}, CreateProjectRequest>, res: Response<ControllerResponse>, next: NextFunction) => {
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
    }
  })

  if(!project) {
    return next(new ErrorResponse(`Unable to update project by uuid ${ req.params.uuid }`, 500))
  }

  res.status(200).json({
    success: true,
    msg: "Project Updated"
  })
})

//@desc    Delete project
//@route   DELETE /api/v1/eng/cip/project/:uuid
//@access  Private
export const deleteProject = asyncHandler(async (req: Request<{ uuid: string }>, res: Response<ControllerResponse>, next: NextFunction) => {
  const result = await Project.destroy({
    where: {
      uuid: req.params.uuid
    }
  })

  if(result === 0) {
    return next(new ErrorResponse(`Unable to delete project by uuid ${ req.params.uuid }`, 500))
  }

  res.status(200).json({
    success: true,
    msg: "Project Deleted"
  })
})
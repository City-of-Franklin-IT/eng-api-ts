import asyncHandler from '@middleware/async'
import { ErrorResponse } from '@utils/errorResponse'
import editorTracking from '@utils/editorTracking'
import { Project, Approval, Resolution, VestingNotification, Milestone, MilestoneExtension, MilestoneStatus, VestingPeriod, VestingExtension, VestingStatus } from '@models/vesting' 

// Types
import { Request, Response, NextFunction } from 'express'
import { Model } from 'sequelize'
import { ControllerResponse } from '@controllers/types'
import { ProjectInterface } from '@models/vesting/types'
import { GetProjectsResponse, GetProjectResponse, CreateProjectRequest, CreateProjectResponse, UpdateProjectRequest } from './types'

//@desc    Get projects
//@route   GET /api/v1/eng/vesting/project
//@access  Private
export const getProjects = asyncHandler(async (req: Request, res: Response<GetProjectsResponse>, next: NextFunction) => {
  const projects = await Project.findAll({
    order: [
      [Milestone, 'number', 'asc'], 
      [Milestone, 'date', 'asc'], 
      ['name', 'asc'], 
      [VestingNotification, 'date', 'desc']
    ],
    include: [
      { model: Approval },
      { model: Resolution },
      { model: Milestone,
          include: [
            { model: MilestoneExtension },
            { model: MilestoneStatus }
          ]
      },
      { model: VestingPeriod,
          include: [
            { model: VestingExtension },
            { model: VestingStatus }
          ]
      },
      { model: VestingNotification },
    ]
  }) as (Model<ProjectInterface> & ProjectInterface)[]

  res.status(200).json({
    success: true,
    data: projects
  })
})

//@desc    Get project
//@route   GET /api/v1/eng/vesting/project/:uuid
//@access  Private
export const getProject = asyncHandler(async (req: Request<{ uuid: string }>, res: Response<GetProjectResponse>, next: NextFunction) => {
  const project = await Project.findOne({
    where: {
      uuid: req.params.uuid
    },
    order: [
      [Milestone, 'number', 'asc'], 
      [Milestone, 'date', 'asc'], 
      ['name', 'asc'], 
      [VestingNotification, 'date', 'desc']
    ],
    include: [
      { model: Approval },
      { model: Resolution },
      { model: Milestone,
          include: [
            { model: MilestoneExtension },
            { model: MilestoneStatus }
          ]
      },
      { model: VestingPeriod,
          include: [
            { model: VestingExtension },
            { model: VestingStatus }
          ]
      },
      { model: VestingNotification },
    ]
  }) as Model<ProjectInterface> & ProjectInterface

  if(!project) {
    return next(new ErrorResponse(`Unable to return project by uuid ${ req.params.uuid }`, 500))
  }

  res.status(200).json({
    success: true,
    data: project
  })
})

//@desc    Create project
//@route   POST /api/v1/eng/vesting/project
//@access  Private
export const createProject = asyncHandler(async (req: Request<{}, {}, CreateProjectRequest>, res: Response<CreateProjectResponse>, next: NextFunction) => {
  const { type, name, cof, ordinance, notes } = req.body

  const project = await Project.create({
    type,
    name,
    cof,
    ordinance,
    notes,
    ...editorTracking(req)
  }) as Model<ProjectInterface> & ProjectInterface

  if(!project) {
    return next(new ErrorResponse('Unable to create new project', 500))
  }

  res.status(201).json({
    success: true,
    msg: 'Project Created',
    data: project
  })
})

//@desc    Update project
//@route   PUT /api/v1/eng/vesting/project/:uuid
//@access  Private
export const updateProject = asyncHandler(async (req: Request<{ uuid: string }, {}, UpdateProjectRequest>, res: Response<ControllerResponse>, next: NextFunction) => {
  const { name, cof, ordinance, expired, notes } = req.body

  const project = await Project.update({
    name,
    cof,
    ordinance,
    expired,
    notes,
    ...editorTracking(req)
  },{
    where: {
      uuid: req.params.uuid
    }
  })

  const [affectedCount] = project

  if(affectedCount === 0) {
    return next(new ErrorResponse(`Unable to update project by uuid ${ req.params.uuid }`, 500))
  }

  res.status(200).json({
    success: true,
    msg: 'Project Updated'
  })
})

//@desc    Delete project
//@route   DELETE /api/v1/eng/vesting/project/:uuid
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
    msg: 'Project Deleted'
  })
})
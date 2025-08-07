import asyncHandler from '@middleware/async'
import { ErrorResponse } from '@utils/errorResponse'
import { Project, Milestone, Phase, Update, Spending } from "@models/cip"

// Types
import { Request, Response, NextFunction } from 'express'
import { Model } from 'sequelize'
import { ProjectInterface } from '@models/cip/types'

//@desc    Get CIP projects
//@route   GET /api/v2/eng/public/cip-projects
//@access  Public
export const getProjects = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const projects = await Project.findAll({
    where: {
      archived: false
    },
    attributes: ['projectId', 'name', 'projectDescription', 'type', 'manager', 'link', 'approvedBudget', 'xCoordinate', 'yCoordinate', 'uuid'],
    order: [['name', 'asc'], [Milestone, 'milestoneEst', 'asc'], [Phase, 'createdAt', 'desc'], [Update, 'createdAt', 'desc']],
    include: [
      { model: Milestone, attributes: ['milestoneDesc', 'milestoneEst', 'milestoneRealized', 'parentId', 'uuid'] },
      { model: Phase, attributes: ['phase', 'parentId', 'uuid', 'createdAt']},
      { model: Update, attributes: ['projectUpdate', 'parentId', 'uuid', 'createdAt']}
    ]
  }) as (Model<ProjectInterface> & ProjectInterface)[]

  res.status(200).json({
    success: true,
    data: projects
  })
})

//@desc    Get project
//@route   GET /api/v2/eng/public/cip-projects/:uuid
//@access  Public
export const getProject = asyncHandler(async (req: Request<{ uuid: string }>, res: Response<{ success: boolean, data: Model<ProjectInterface> & ProjectInterface }>, next: NextFunction) => {
  const project = await Project.findOne({
    where: {
      uuid: req.params.uuid
    },
    attributes: ['projectId', 'name', 'projectDescription', 'type', 'manager', 'link', 'approvedBudget', 'xCoordinate', 'yCoordinate', 'uuid'],
    order: [['name', 'asc'], [Milestone, 'milestoneEst', 'asc'], [Phase, 'createdAt', 'desc'], [Update, 'createdAt', 'desc']],
    include: [
      { model: Milestone, attributes: ['milestoneDesc', 'milestoneEst', 'milestoneRealized', 'parentId', 'uuid'] },
      { model: Phase, attributes: ['phase', 'parentId', 'uuid', 'createdAt']},
      { model: Update, attributes: ['projectUpdate', 'parentId', 'uuid', 'createdAt']}
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
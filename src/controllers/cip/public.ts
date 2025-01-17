import asyncHandler from '@middleware/async'
import { ErrorResponse } from '@utils/errorResponse'
import { Project, Milestone, Phase, Update, Spending } from "@models/cip"

// Types
import { Request, Response, NextFunction } from 'express'
import { Model } from 'sequelize'
import { ProjectInterface } from '@models/cip/types'

//@desc    Get CIP projects
//@route   GET /api/v1/eng/public/cip-projects
//@access  Public
export const getProjects = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const projects = await Project.findAll({
    where: {
      archived: false
    },
    attributes: ['projectId', 'name', 'projectDescription', 'type', 'manager', 'link', 'approvedBudget', 'xCoordinate', 'yCoordinate', 'uuid'],
    order: [['name', 'asc'], [Milestone, 'milestoneEst', 'asc'], [Phase, 'createdAt', 'desc'], [Update, 'createdAt', 'desc'], [{ model: Spending, as: 'Spending'}, 'dollarsSpentDate', 'desc']],
    include: [
      { model: Milestone, attributes: ['milestoneDesc', 'milestoneEst', 'milestoneRealized', 'parentId', 'uuid'] },
      { model: Phase, attributes: ['phase', 'parentId', 'uuid', 'createdAt']},
      { model: Update, attributes: ['projectUpdate', 'parentId', 'uuid', 'createdAt']},
      { model: Spending, as: 'Spending', attributes: ['dollarsSpent', 'dollarsSpentDate', 'uuid', 'createdAt']
    }]
  }) as (Model<ProjectInterface> & ProjectInterface)[]

  if(!projects) {
    return next(new ErrorResponse("Could not return CIP projects", 500))
  }

  res.status(200).json({
    success: true,
    data: projects
  })
})
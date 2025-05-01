import asyncHandler from '@middleware/async'
import { ErrorResponse } from '@utils/errorResponse'
import { Milestone } from '@models/cip'
import editorTracking from '@utils/editorTracking'

// Types
import { Request, Response, NextFunction } from 'express'
import { ControllerResponse } from '@controllers/types'
import { CreateMilestoneRequest, UpdateProjectMilestoneRequest } from './types'

//@desc    Create new project milestone
//@route   POST /api/v1/eng/cip/milestones
//@access  Private
export const createMilestone = asyncHandler(async (req: Request<{}, {}, CreateMilestoneRequest>, res: Response<ControllerResponse>, next: NextFunction) => {
  const { milestoneDesc, milestoneEst, milestoneRealized, parentId } = req.body

  const milestone = await Milestone.create({
    milestoneDesc,
    milestoneEst: milestoneEst,
    milestoneRealized: milestoneRealized,
    parentId,
    ...editorTracking(req)
  })

  if(!milestone) {
    return next(new ErrorResponse('Unable to create new milestone', 500))
  }

  res.status(201).json({
    success: true,
    msg: "Milestone Created"
  })
})

//@desc    Update project milestone
//@route   PUT /api/v1/eng/cip/milestones/:uuid
//@access  Private
export const updateMilestone = asyncHandler(async (req: Request<{ uuid: string }, {}, UpdateProjectMilestoneRequest>, res: Response<ControllerResponse>, next: NextFunction) => {
  const { milestoneDesc, milestoneEst, milestoneRealized } = req.body

  const milestone = await Milestone.update({
    milestoneDesc,
    milestoneEst: milestoneEst,
    milestoneRealized: milestoneRealized,
    ...editorTracking(req)
  },{
    where: {
      uuid: req.params.uuid
    }
  })

  if(!milestone) {
    return next(new ErrorResponse(`Unable to update milestone with uuid ${ req.params.uuid }`, 500))
  }

  res.status(200).json({
    success: true,
    msg: "Milestone Updated"
  })
})

//@desc    Delete project milestone
//@route   DELETE /api/v1/eng/cip/milestones/:uuid
//@access  Private
export const deleteMilestone = asyncHandler(async (req: Request<{ uuid: string }, {}>, res: Response<ControllerResponse>, next: NextFunction) => {
  const result = await Milestone.destroy({
    where: {
      uuid: req.params.uuid
    }
  })

  if(result === 0) {
    return next(new ErrorResponse(`Unable to delete project milestone by uuid ${ req.params.uuid }`, 500))
  }

  res.status(200).json({
    success: true,
    msg: "Milestone Deleted"
  })
})
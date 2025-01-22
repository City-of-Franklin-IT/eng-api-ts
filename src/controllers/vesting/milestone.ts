import asyncHandler from '@middleware/async'
import { ErrorResponse } from '@utils/errorResponse'
import { Milestone, MilestoneStatus } from '@models/vesting'

// Types
import { Request, Response, NextFunction } from 'express'
import { Model } from 'sequelize'
import { ControllerResponse } from '@controllers/types'
import { MilestoneInterface } from '@models/vesting/types'
import { CreateMilestoneRequest, UpdateMilestoneRequest, UpdateMilestoneStatusRequest } from './types'

//@desc    Create milestone
//@route   POST /api/v1/eng/vesting/milestone
//@access  Private
export const createMilestone = asyncHandler(async (req: Request<{}, {}, CreateMilestoneRequest>, res: Response<ControllerResponse>, next: NextFunction) => {
  const { number, date, parentId } = req.body

  const email = req.user?.email

  const milestone = await Milestone.create({
    number,
    date,
    parentId,
    createdBy: email,
    updatedBy: email
  }) as Model<MilestoneInterface> & MilestoneInterface

  if(!milestone) {
    return next(new ErrorResponse('Could not create new milestone', 500))
  }

  const { uuid } = milestone

  await MilestoneStatus.create({ // Create milestone status
    parentId: uuid,
    createdBy: email,
    updatedBy: email
  })

  res.status(201).json({
    success: true,
    msg: 'Milestone Created'
  })
})

//@desc    Update milestone
//@route   PUT /api/v1/eng/vesting/milestone/:uuid
//@access  Private
export const updateMilestone = asyncHandler(async (req: Request<{ uuid: string }, {}, UpdateMilestoneRequest>, res: Response<ControllerResponse>, next: NextFunction) => {
  const { date } = req.body

  const email = req.user?.email

  const milestone = await Milestone.update({
    date,
    updatedBy: email
  },{
    where: {
      uuid: req.params.uuid
    }
  })
  
  const [affectedCount] = milestone

  if(affectedCount === 0) {
    return next(new ErrorResponse(`Unable to update milestone by uuid ${ req.params.uuid }`, 500))
  }

  res.status(200).json({
    success: true,
    msg: "Milestone Updated"
  })
})

//@desc    Update milestone status
//@route   PUT /api/v1/eng/vesting/milestone/status/:uuid
//@access  Private
export const updateMilestoneStatus = asyncHandler(async (req: Request<{ uuid: string }, {}, UpdateMilestoneStatusRequest>, res: Response<ControllerResponse>, next: NextFunction) => {
  const { achieved, expired } = req.body

  const email = req.user?.email

  const status = await MilestoneStatus.update({
    achieved,
    expired,
    updatedBy: email
  },{
    where: {
      uuid: req.params.uuid
    }
  })

  const [affectedCount] = status

  if(affectedCount === 0) {
    return next(new ErrorResponse(`Unable to update milestone status by uuid ${ req.params.uuid }`, 500))
  }

  res.status(200).json({
    success: true,
    msg: "Milestone Status Updated"
  })
})
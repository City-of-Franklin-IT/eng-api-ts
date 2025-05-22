import asyncHandler from '@middleware/async'
import { ErrorResponse } from '@utils/errorResponse'
import editorTracking from '@utils/editorTracking'
import { Milestone, MilestoneStatus } from '@models/vesting'

// Types
import { Request, Response, NextFunction } from 'express'
import { Model } from 'sequelize'
import { ControllerResponse } from '@controllers/types'
import * as Types from '@models/vesting/types'

//@desc    Create milestone
//@route   POST /api/v1/eng/vesting/milestone
//@access  Private
export const createMilestone = asyncHandler(async (req: Request<{}, {}, Types.MilestoneCreationAttributes>, res: Response<ControllerResponse>, next: NextFunction) => {
  const { number, date, parentId } = req.body

  const milestone = await Milestone.create({
    number,
    date,
    parentId,
    ...editorTracking(req)
  }) as Model<Types.MilestoneInterface> & Types.MilestoneInterface

  if(!milestone) {
    return next(new ErrorResponse('Could not create new milestone', 500))
  }

  const { uuid } = milestone

  await MilestoneStatus.create({ // Create milestone status
    parentId: uuid,
    ...editorTracking(req)
  })

  res.status(201).json({
    success: true,
    msg: 'Milestone Created'
  })
})

//@desc    Update milestone
//@route   PUT /api/v2/eng/vesting/milestone/:uuid
//@access  Private
export const updateMilestone = asyncHandler(async (req: Request<{ uuid: string }, {}, Types.MilestoneCreationAttributes>, res: Response<ControllerResponse>, next: NextFunction) => {
  const { date } = req.body

  const result = await Milestone.update({
    date,
    ...editorTracking(req)
  },{
    where: {
      uuid: req.params.uuid
    }
  })

  const [affectedCount] = result

  if(affectedCount === 0) {
    return next(new ErrorResponse(`Unable to update milestone by status ${ req.params.uuid }`, 500))
  }

  res.status(200).json({
    success: true,
    msg: "Milestone Updated"
  })
})

//@desc    Update milestone status
//@route   PUT /api/v1/eng/vesting/milestone/status/:uuid
//@access  Private
export const updateMilestoneStatus = asyncHandler(async (req: Request<{ uuid: string }, {}, Types.MilestoneStatusCreationAttributes>, res: Response<ControllerResponse>, next: NextFunction) => {
  const { achieved, expired } = req.body

  const status = await MilestoneStatus.update({
    achieved,
    expired,
    ...editorTracking(req)
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
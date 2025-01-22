import asyncHandler from '@middleware/async'
import { ErrorResponse } from '@utils/errorResponse'
import { MilestoneExtension } from '@models/vesting' 

// Types
import { Request, Response, NextFunction } from 'express'
import { Model } from 'sequelize'
import { ControllerResponse } from '@controllers/types'
import { MilestoneExtensionInterface } from '@models/vesting/types'
import { CreateMilestoneExtensionRequest } from './types'

//@desc    Create extension
//@route   POST /api/v1/eng/vesting/extension
//@access  Private
export const createMilestoneExtension = asyncHandler(async (req: Request<{}, {}, CreateMilestoneExtensionRequest>, res: Response, next: NextFunction) => {
  const { date, parentId } = req.body

  const email = req.user?.email

  const extension = await MilestoneExtension.create({ // Create milestone extension
    date,
    parentId,
    createdBy: email,
    updatedBy: email
  })

  if(!extension) {
    return next(new ErrorResponse('Could not create milestone extension', 500))
  }

  res.status(201).json({
    success: true,
    msg: 'Milestone Extension Created'
  })
})

//@desc    Update extension
//@route   PUT /api/v1/eng/vesting/extension/:uuid
//@access  Private
export const updateMilestoneExtension = asyncHandler(async (req: Request<{ uuid: string }>, res: Response, next: NextFunction) => {
  const { date } = req.body

  const email = req.user?.email

  const extension = await MilestoneExtension.update({
    date,
    updatedBy: email
  },{
    where: {
      uuid: req.params.uuid
    },
    returning: true
  })

  const [affectedCount, affectedRows] = extension

  if(affectedCount === 0) {
    return next(new ErrorResponse(`Unable to update milestone extension by uuid ${ req.params.uuid }`, 500))
  }

  const data = (affectedRows as (Model<MilestoneExtensionInterface> & MilestoneExtensionInterface)[])[0]

  res.status(200).json({
    success: true,
    msg: "Milestone Extension Updated",
    data
  })
})

//@desc    Delete extension
//@route   DELETE /api/v1/eng/vesting/extension/:uuid
//@access  Private
export const deleteMilestoneExtension = asyncHandler(async (req: Request<{ uuid: string }>, res: Response<ControllerResponse>, next: NextFunction) => {
  const result = await MilestoneExtension.destroy({ // Delete extension
    where: {
      uuid: req.params.uuid
    }
  })

  if(result === 0) {
    return next(new ErrorResponse(`Unable to delete milestone extension by uuid ${ req.params.uuid }`, 500))
  }

  res.status(200).json({
    success: true,
    msg: 'Milestone Extension Deleted'
  })
})
import asyncHandler from '@middleware/async'
import { ErrorResponse } from '@utils/errorResponse'
import editorTracking from '@utils/editorTracking'
import { MilestoneExtension } from '@models/vesting' 

// Types
import { Request, Response, NextFunction } from 'express'
import { Model } from 'sequelize'
import { ControllerResponse } from '@controllers/types'
import * as Types from '@models/vesting/types'

//@desc    Create extension
//@route   POST /api/v2/eng/vesting/extension
//@access  Private
export const createMilestoneExtension = asyncHandler(async (req: Request<{}, {}, Types.MilestoneCreationAttributes>, res: Response<ControllerResponse & { data: Types.MilestoneExtensionInterface }>) => {
  const { date, parentId } = req.body

  const extension = await MilestoneExtension.create({ // Create milestone extension
    date,
    parentId,
    ...editorTracking(req)
  }) as Model<Types.MilestoneExtensionInterface> & Types.MilestoneExtensionInterface

  res.status(201).json({
    success: true,
    msg: 'Milestone Extension Created',
    data: extension
  })
})

//@desc    Update milestone extension
//@route   PUT /api/v2/eng/vesting/extension/:uuid
//@access  Private
export const updateMilestoneExtension = asyncHandler(async (req: Request<{ uuid: string }, {}, Types.MilestoneExtensionCreationAttributes>, res:Response<ControllerResponse & { data: Types.MilestoneExtensionInterface }>, next: NextFunction) => {
  const { date } = req.body

  const result = await MilestoneExtension.update({
    date,
    ...editorTracking(req)
  },{
    where: {
      uuid: req.params.uuid
    },
    returning: true
  })

  const [affectedCount, affectedRows] = result

  if(affectedCount === 0) {
    return next(new ErrorResponse(`Unable to update milestone extension by uuid ${ req.params.uuid }`, 404))
  }

  const data = affectedRows[0] as Model<Types.MilestoneExtensionInterface> & Types.MilestoneExtensionInterface

  res.status(200).json({
    success: true,
    msg: "Milestone Extension Updated",
    data
  })
})

//@desc    Delete extension
//@route   DELETE /api/v2/eng/vesting/extension/:uuid
//@access  Private
export const deleteMilestoneExtension = asyncHandler(async (req: Request<{ uuid: string }>, res: Response<ControllerResponse>, next: NextFunction) => {
  const result = await MilestoneExtension.destroy({ // Delete extension
    where: {
      uuid: req.params.uuid
    }
  })

  if(result === 0) {
    return next(new ErrorResponse(`Unable to delete milestone extension by uuid ${ req.params.uuid }`, 404))
  }

  res.status(200).json({
    success: true,
    msg: 'Milestone Extension Deleted'
  })
})
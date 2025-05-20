import asyncHandler from '@middleware/async'
import { ErrorResponse } from '@utils/errorResponse'
import editorTracking from '@utils/editorTracking'
import { MilestoneExtension } from '@models/vesting' 

// Types
import { Request, Response, NextFunction } from 'express'
import { ControllerResponse } from '@controllers/types'
import { CreateMilestoneExtensionRequest, UpdateMilestoneExtensionRequest } from './types'

//@desc    Create extension
//@route   POST /api/v1/eng/vesting/extension
//@access  Private
export const createMilestoneExtension = asyncHandler(async (req: Request<{}, {}, CreateMilestoneExtensionRequest>, res: Response, next: NextFunction) => {
  const { date, parentId } = req.body

  const extension = await MilestoneExtension.create({ // Create milestone extension
    date,
    parentId,
    ...editorTracking(req)
  })

  if(!extension) {
    return next(new ErrorResponse('Could not create milestone extension', 500))
  }

  res.status(201).json({
    success: true,
    msg: 'Milestone Extension Created'
  })
})

//@desc    Update milestone extension
//@route   PUT /api/v2/eng/vesting/extension/:uuid
//@access  Private
export const updateMilestoneExtension = asyncHandler(async (req: Request<{ uuid: string }, {}, UpdateMilestoneExtensionRequest>, res:Response<ControllerResponse>, next: NextFunction) => {
  const { date } = req.body

  const result = await MilestoneExtension.update({
    date,
    ...editorTracking(req)
  },{
    where: {
      uuid: req.params.uuid
    }
  })

  const [affectedCount] = result

  if(affectedCount === 0) {
    return next(new ErrorResponse(`Unable to update milestone extension by uuid ${ req.params.uuid }`, 500))
  }

  res.status(200).json({
    success: true,
    msg: "Milestone Extension Updated"
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
import asyncHandler from '@middleware/async'
import { ErrorResponse } from '@utils/errorResponse'
import editorTracking from '@utils/editorTracking'
import { VestingExtension } from '@models/vesting' 

// Types
import { Request, Response, NextFunction } from 'express'
import { ControllerResponse } from '@controllers/types'
import * as Types from '@models/vesting/types'

//@desc    Create vesting extension
//@route   POST /api/v2/eng/vesting/vesting-extension
//@access  Private
export const createVestingExtension = asyncHandler(async (req: Request<{}, {}, Types.VestingExtensionCreationAttributes>, res: Response<ControllerResponse>, next: NextFunction) => {
  const { date, parentId } = req.body

  const extension = await VestingExtension.create({ // Create vesting extension
    date,
    parentId,
    ...editorTracking(req)
  })

  if(!extension) {
    return next(new ErrorResponse('Could not create vesting extension', 500))
  }

  res.status(201).json({
    success: true,
    msg: 'Vesting Extension Created'
  })
})

//@desc    Update vesting extension
//@route   PUT /api/v2/eng/vesting/vesting-extension/:uuid
//@access  Private
export const updateVestingExtension = asyncHandler(async (req: Request<{ uuid: string }, {}, Types.VestingExtensionCreationAttributes>, res: Response<ControllerResponse>, next: NextFunction) => {
  const { date } = req.body

  const result = await VestingExtension.update({
    date,
    ...editorTracking(req)
  },{
    where: {
      uuid: req.params.uuid
    }
  })

  const [affectedCount] = result

  if(affectedCount === 0) {
    return next(new ErrorResponse(`Unable to update vesting extension by uuid ${ req.params.uuid }`, 500))
  }

  res.status(200).json({
    success: true,
    msg: "Vesting Extension Updated"
  })
})

//@desc    Delete vesting extension
//@route   DELETE /api/v1/eng/vesting/vesting-extension/:uuid
//@access  Private
export const deleteVestingExtension = asyncHandler(async (req: Request<{ uuid: string }>, res: Response<ControllerResponse>, next: NextFunction) => {
  const result = await VestingExtension.destroy({ // Delete vesting extension
    where: {
      uuid: req.params.uuid
    }
  })

  if(result === 0) {
    return next(new ErrorResponse(`Unable to delete vesting extension by uuid ${ req.params.uuid }`, 500))
  }

  res.status(200).json({
    success: true,
    msg: 'Vesting Extension Deleted'
  })
})
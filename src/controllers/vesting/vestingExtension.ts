import asyncHandler from '@middleware/async'
import { ErrorResponse } from '@utils/errorResponse'
import editorTracking from '@utils/editorTracking'
import { VestingExtension } from '@models/vesting' 

// Types
import { Request, Response, NextFunction } from 'express'
import { Model } from 'sequelize'
import { ControllerResponse } from '@controllers/types'
import * as Types from '@models/vesting/types'

//@desc    Create vesting extension
//@route   POST /api/v2/eng/vesting/vesting-extension
//@access  Private
export const createVestingExtension = asyncHandler(async (req: Request<{}, {}, Types.VestingExtensionCreationAttributes>, res: Response<ControllerResponse & { data: Types.VestingExtensionInterface }>) => {
  const { date, parentId } = req.body

  const extension = await VestingExtension.create({ // Create vesting extension
    date,
    parentId,
    ...editorTracking(req)
  }) as Model<Types.VestingExtensionInterface> & Types.VestingExtensionInterface

  res.status(201).json({
    success: true,
    msg: 'Vesting Extension Created',
    data: extension
  })
})

//@desc    Update vesting extension
//@route   PUT /api/v2/eng/vesting/vesting-extension/:uuid
//@access  Private
export const updateVestingExtension = asyncHandler(async (req: Request<{ uuid: string }, {}, Types.VestingExtensionCreationAttributes>, res: Response<ControllerResponse & { data: Types.VestingExtensionInterface }>, next: NextFunction) => {
  const { date } = req.body

  const result = await VestingExtension.update({
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
    return next(new ErrorResponse(`Unable to update vesting extension by uuid ${ req.params.uuid }`, 404))
  }

  const data = affectedRows[0] as Model<Types.VestingExtensionInterface> & Types.VestingExtensionInterface

  res.status(200).json({
    success: true,
    msg: "Vesting Extension Updated",
    data
  })
})

//@desc    Delete vesting extension
//@route   DELETE /api/v2/eng/vesting/vesting-extension/:uuid
//@access  Private
export const deleteVestingExtension = asyncHandler(async (req: Request<{ uuid: string }>, res: Response<ControllerResponse>, next: NextFunction) => {
  const result = await VestingExtension.destroy({ // Delete vesting extension
    where: {
      uuid: req.params.uuid
    }
  })

  if(result === 0) {
    return next(new ErrorResponse(`Unable to delete vesting extension by uuid ${ req.params.uuid }`, 404))
  }

  res.status(200).json({
    success: true,
    msg: 'Vesting Extension Deleted'
  })
})
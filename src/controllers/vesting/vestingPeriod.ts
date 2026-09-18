import asyncHandler from '@middleware/async'
import { ErrorResponse } from '@utils/errorResponse'
import editorTracking from '@utils/editorTracking'
import { VestingPeriod, VestingStatus } from '@models/vesting'

// Types
import { Request, Response, NextFunction } from 'express'
import { Model } from 'sequelize'
import { ControllerResponse } from '@controllers/types'
import * as Types from '@models/vesting/types'

//@desc    Create vesting period
//@route   POST /api/v2/eng/vesting/period
//@access  Private
export const createVestingPeriod = asyncHandler(async (req: Request<{}, {}, Types.VestingPeriodCreationAttributes>, res: Response<ControllerResponse & { data: Types.VestingPeriodInterface }>) => {
  const { type, date, parentId } = req.body

  const result = await VestingPeriod.create({
    type,
    date,
    parentId,
    ...editorTracking(req)
  }) as Model<Types.VestingPeriodInterface> & Types.VestingPeriodInterface

  const { uuid } = result

  await VestingStatus.create({ // Create empty vesting status entry
    parentId: uuid,
    ...editorTracking(req)
  })

  res.status(201).json({
    success: true,
    msg: "Vesting Period Created",
    data: result
  })
})

//@desc    Update vesting period
//@route   PUT /api/v2/eng/vesting/period/:uuid
//@access  Private
export const updateVestingPeriod = asyncHandler(async (req: Request<{ uuid: string }, {}, Types.VestingPeriodCreationAttributes>, res: Response<ControllerResponse & { data: Types.VestingPeriodInterface }>, next: NextFunction) => {
  const { date } = req.body

  const result = await VestingPeriod.update({
    date,
    ...editorTracking(req)
  },
  {
    where: {
      uuid: req.params.uuid
    },
    returning: true
  })

  const [affectedCount, affectedRows] = result

  if(affectedCount === 0) {
    return next(new ErrorResponse(`Unable to update vesting period by uuid ${ req.params.uuid }`, 404))
  }

  const data = affectedRows[0] as Model<Types.VestingPeriodInterface> & Types.VestingPeriodInterface

  res.status(200).json({
    success: true,
    msg: "Vesting Period Updated",
    data
  })
})

//@desc    Delete vesting period
//@route   DELETE /api/v2/eng/vesting/period/:uuid
//@access  Private
export const deleteVestingPeriod = asyncHandler(async (req: Request<{ uuid: string }>, res: Response<ControllerResponse>, next: NextFunction) => {
  const result = await VestingPeriod.destroy({
    where: {
      uuid: req.params.uuid
    }
  })

  if(result === 0) {
    return next(new ErrorResponse(`Unable to delete vesting period by uuid ${ req.params.uuid }`, 404))
  }

  res.status(200).json({
    success: true,
    msg: "Vesting Period Deleted"
  })
})

//@desc    Update vesting status
//@route   PUT /api/v2/eng/vesting/period/status/:uuid
//@access  Private
export const updateVestingStatus = asyncHandler(async (req: Request<{ uuid: string }, {}, Types.VestingStatusCreationAttributes>, res: Response<ControllerResponse & { data: Types.VestingStatusInterface }>, next: NextFunction) => {
  const { achieved, expired } = req.body

  const status = await VestingStatus.update({
    achieved,
    expired,
    ...editorTracking(req)
  },{
    where: {
      uuid: req.params.uuid
    },
    returning: true
  })

  const [affectedCount, affectedRows] = status

  if(affectedCount === 0) {
    return next(new ErrorResponse(`Unable to update project vesting status by uuid ${ req.params.uuid }`, 404))
  }

  const data = affectedRows[0] as Model<Types.VestingStatusInterface> & Types.VestingStatusInterface

  res.status(200).json({
    success: true,
    msg: "Vesting Status Updated",
    data
  })
})
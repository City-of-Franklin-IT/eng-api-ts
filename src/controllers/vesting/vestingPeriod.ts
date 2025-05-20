import asyncHandler from '@middleware/async'
import { ErrorResponse } from '@utils/errorResponse'
import editorTracking from '@utils/editorTracking'
import { VestingPeriod, VestingStatus } from '@models/vesting'

// Types
import { Request, Response, NextFunction } from 'express'
import { Model } from 'sequelize'
import { ControllerResponse } from '@controllers/types'
import { VestingPeriodInterface } from '@models/vesting/types'
import { CreateVestingPeriodRequest, UpdateVestingStatusRequest, UpdateVestingPeriodRequest } from './types'

//@desc    Create vesting period
//@route   POST /api/v2/eng/vesting/period
//@access  Private
export const createVestingPeriod = asyncHandler(async (req: Request<{}, {}, CreateVestingPeriodRequest>, res: Response<ControllerResponse>, next: NextFunction) => {
  const { type, date, parentId } = req.body

  const result = await VestingPeriod.create({
    type,
    date,
    parentId,
    ...editorTracking(req)
  }) as Model<VestingPeriodInterface> & VestingPeriodInterface

  if(!result) {
    return next(new ErrorResponse('Unable to create new vesting period', 500))
  }

  const { uuid } = result

  const newStatus = await VestingStatus.create({ // Create empty vesting status entry
    parentId: uuid,
    ...editorTracking(req)
  })

  if(!newStatus) {
    return next(new ErrorResponse('Unable to create new vesting status', 500))
  }

  res.status(201).json({
    success: true,
    msg: "Vesting Period Created"
  })
})

//@desc    Update vesting period
//@route   PUT /api/v2/eng/vesting/period/:uuid
//@access  Private
export const updateVestingPeriod = asyncHandler(async (req: Request<{ uuid: string }, {}, UpdateVestingPeriodRequest>, res: Response<ControllerResponse>, next: NextFunction) => {
  const { date } = req.body

  const result = await VestingPeriod.update({
    date,
    ...editorTracking(req)
  },
  {
    where: {
      uuid: req.params.uuid
    }
  })

  const [affectedCount] = result

  if(affectedCount === 0) {
    return next(new ErrorResponse(`Unable to update vesting period by uuid ${ req.params.uuid }`, 500))
  }

  res.status(200).json({
    success: true,
    msg: "Vesting Period Updated"
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
    return next(new ErrorResponse(`Unable to delete vesting period by uuid ${ req.params.uuid }`, 500))
  }

  res.status(200).json({
    success: true,
    msg: "Vesting Period Deleted"
  })
})

//@desc    Update vesting status
//@route   PUT /api/v1/eng/vesting/period/status/:uuid
//@access  Private
export const updateVestingStatus = asyncHandler(async (req: Request<{ uuid: string }, {}, UpdateVestingStatusRequest>, res: Response<ControllerResponse>, next: NextFunction) => {
  const { achieved, expired } = req.body

  const status = await VestingStatus.update({
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
    return next(new ErrorResponse(`Unable to update project vesting status by uuid ${ req.params.uuid }`, 500))
  }

  res.status(200).json({
    success: true,
    msg: "Vesting Status Updated"
  })
})
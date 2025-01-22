import asyncHandler from '@middleware/async'
import { ErrorResponse } from '@utils/errorResponse'
import { VestingNotification } from '@models/vesting'

// Types
import { Request, Response, NextFunction } from 'express'
import { ControllerResponse } from '@controllers/types'
import { CreateNotificationRequest, UpdateNotificationRequest } from './types'

//@desc    Create notification
//@route   POST /api/v1/eng/vesting/notification
//@access  Private
export const createNotification = asyncHandler(async (req: Request<{}, {}, CreateNotificationRequest>, res: Response<ControllerResponse>, next: NextFunction) => {
  const { date, type, parentId } = req.body

  const email = req.user?.email

  const notification = await VestingNotification.create({
    date,
    type,
    parentId,
    createdBy: email,
    updatedBy: email
  })

  if(!notification) {
    return next(new ErrorResponse('Unable to create notification', 500))
  }

  res.status(201).json({
    success: true,
    msg: 'Notification Created'
  })
})

//@desc    Update notification
//@route   PUT /api/v1/eng/vesting/notification/:uuid
//@access  Private
export const updateNotification = asyncHandler(async (req: Request<{ uuid: string }, {}, UpdateNotificationRequest>, res: Response<ControllerResponse>, next: NextFunction) => {
  const { date } = req.body

  const email = req.user?.email

  const notification = await VestingNotification.update({
    date,
    updatedBy: email
  },{
    where: {
      uuid: req.params.uuid
    }
  })

  const [affectedCount] = notification

  if(affectedCount === 0) {
    return next(new ErrorResponse(`Unable to update notification by uuid ${ req.params.uuid }`, 500))
  }

  res.status(200).json({
    success: true,
    msg: 'Notification Updated'
  })
})

//@desc    Delete notification
//@route   DELETE /api/v1/eng/vesting/notification/:uuid
//@access  Private
export const deleteNotification = asyncHandler(async (req: Request<{ uuid: string }>, res: Response<ControllerResponse>, next: NextFunction) => {
  const result = await VestingNotification.destroy({
    where: {
      uuid: req.params.uuid
    }
  })

  if(result === 0) {
    return next(new ErrorResponse(`Unable to delete notification by uuid ${ req.params.uuid }`, 500))
  }

  res.status(200).json({
    success: true,
    msg: 'Notification Deleted'
  })
})
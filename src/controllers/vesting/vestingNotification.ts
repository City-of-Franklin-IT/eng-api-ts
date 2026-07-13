import asyncHandler from '@middleware/async'
import { ErrorResponse } from '@utils/errorResponse'
import editorTracking from '@utils/editorTracking'
import { VestingNotification } from '@models/vesting'

// Types
import { Request, Response, NextFunction } from 'express'
import { Model } from 'sequelize'
import { ControllerResponse } from '@controllers/types'
import * as Types from '@models/vesting/types'

//@desc    Create notification
//@route   POST /api/v2/eng/vesting/notification
//@access  Private
export const createNotification = asyncHandler(async (req: Request<{}, {}, Types.VestingNotificationCreationAttributes>, res: Response<ControllerResponse & { data: Types.VestingNotificationInterface }>) => {
  const { date, type, parentId } = req.body

  const notification = await VestingNotification.create({
    date,
    type,
    parentId,
    ...editorTracking(req)
  }) as Model<Types.VestingNotificationInterface> & Types.VestingNotificationInterface

  res.status(201).json({
    success: true,
    msg: 'Notification Created',
    data: notification
  })
})

//@desc    Update notification
//@route   PUT /api/v2/eng/vesting/notification/:uuid
//@access
export const updateNotification = asyncHandler(async (req: Request<{ uuid: string }, {}, Types.VestingNotificationCreationAttributes>, res: Response<ControllerResponse & { data: Types.VestingNotificationInterface }>, next: NextFunction) => {
  const { date } = req.body

  const result = await VestingNotification.update({
    date
  },{
    where: {
      uuid: req.params.uuid
    },
    returning: true
  })

  const [affectedCount, affectedRows] = result

  if(affectedCount === 0) {
    return next(new ErrorResponse(`Unable to updated notification by uuid ${ req.params.uuid }`, 404))
  }

  const data = affectedRows[0] as Model<Types.VestingNotificationInterface> & Types.VestingNotificationInterface

  res.status(200).json({
    success: true,
    msg: 'Notification Updated',
    data
  })
})

//@desc    Delete notification
//@route   DELETE /api/v2/eng/vesting/notification/:uuid
//@access  Private
export const deleteNotification = asyncHandler(async (req: Request<{ uuid: string }>, res: Response<ControllerResponse>, next: NextFunction) => {
  const result = await VestingNotification.destroy({
    where: {
      uuid: req.params.uuid
    }
  })

  if(result === 0) {
    return next(new ErrorResponse(`Unable to delete notification by uuid ${ req.params.uuid }`, 404))
  }

  res.status(200).json({
    success: true,
    msg: 'Notification Deleted'
  })
})
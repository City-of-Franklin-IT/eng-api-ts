import { nanoid } from 'nanoid'
import asyncHandler from '@middleware/async'
import { ErrorResponse } from '@utils/errorResponse'
import { Log } from '@models/stormwater'

// Types
import { Request, Response, NextFunction } from 'express'
import { Model } from 'sequelize'
import { LogInterface } from '@models/stormwater/types'
import { CreateLogRequest, CreateLogResponse, GetLogResponse, GetLogsResponse, UpdateLogRequest, UpdateLogResponse } from './types'

// @desc    Create log
// @route   POST /api/v1/stormwater/logs
// @access  Private
export const createLog = asyncHandler(async (req: Request<{}, {}, CreateLogRequest>, res: Response<CreateLogResponse>, next: NextFunction) => {
  const { siteId, inspectionDate } = req.body

  const email = req.user?.email

  const log = await Log.create({
    logId: `log-${ nanoid() }`,
    siteId,
    inspectionDate,
    createdBy: email,
    updatedBy: email,
  }) as Model<LogInterface>

  if(!log) {
    return next(new ErrorResponse("Could not create new log", 500))
  }

  res.status(201).json({
    success: true,
    msg: "Site Log Created",
    data: log
  })
})

//@desc    Get log
//@route   GET /api/v1/stormwater/logs/:uuid
//@access  Private
export const getLog = asyncHandler(async (req: Request<{ uuid: string }>, res: Response<GetLogResponse>, next: NextFunction) => {
  const log = await Log.findOne({
    where: {
      uuid: req.params.uuid
    }
  }) as Model<LogInterface>

  if(!log) {
    return next(new ErrorResponse(`Could not return log by uuid ${ req.params.uuid }`, 500))
  }

  res.status(200).json({
    success: true,
    data: log
  })
})

// @desc    Get logs
// @route   GET /api/v1/stormwater/logs/:siteid
// @access  Private
export const getLogs = asyncHandler(async (req: Request<{ siteid: string }>, res: Response<GetLogsResponse>, next: NextFunction) => {
  const logs = await Log.findAll({
    where: {
      siteId: req.params.siteid
    }
  }) as Model<LogInterface>[]

  if(!logs) {
    return next(new ErrorResponse(`Could not return logs for siteId ${ req.params.siteid }`, 500))
  }

  res.status(200).json({
    success: true,
    data: logs
  })
})

// @desc    Update log
// @route   PUT /api/v1/stormwater/logs/:uuid
// @access  Private
export const updateLog = asyncHandler(async (req: Request<{ uuid: string }, {}, UpdateLogRequest>, res: Response<UpdateLogResponse>, next: NextFunction) => {
  const { inspectionDate } = req.body

  const email = req.user?.email

  const log = await Log.update({
    inspectionDate,
    updatedBy: email
  },{
    where: {
      uuid: req.params.uuid
    },
    returning: true
  })

  if(!log[1].length) {
    return next(new ErrorResponse(`Unable to update log by uuid ${ req.params.uuid }`, 500))
  }

  const data = log[1] as Model<LogInterface>[] & LogInterface

  res.status(200).json({
    success: true,
    msg: "Site Log Updated",
    data
  })
})

// @desc    Delete log
// @route   DELETE /api/v1/stormwater/logs/:uuid
// @access  Private
export const deleteLog = asyncHandler(async (req: Request<{ uuid: string }>, res: Response, next: NextFunction) => {
  await Log.destroy({
    where: {
      uuid: req.params.uuid
    }
  })

  res.status(200).json({
    success: true,
    msg: "Site Log Deleted"
  })
})
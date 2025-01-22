import asyncHandler from '@middleware/async'
import { ErrorResponse } from '@utils/errorResponse'
import { Log } from '@models/stormwater'

// Types
import { Request, Response, NextFunction } from 'express'
import { Model } from 'sequelize'
import { LogInterface } from '@models/stormwater/types'
import { CreateLogRequest, CreateLogResponse, GetLogResponse, UpdateLogRequest, UpdateLogResponse } from './types'

// @desc    Create log
// @route   POST /api/v1/stormwater/logs
// @access  Private
export const createLog = asyncHandler(async (req: Request<{}, {}, CreateLogRequest>, res: Response<CreateLogResponse>, next: NextFunction) => {
  const { siteId, inspectionDate } = req.body

  const email = req.user?.email

  const { nanoid } = await import('nanoid')

  const log = await Log.create({
    logId: `log-${ nanoid() }`,
    siteId,
    inspectionDate,
    createdBy: email,
    updatedBy: email,
  }) as Model<LogInterface> & LogInterface

  if(!log) {
    return next(new ErrorResponse("Unable to create new site log", 500))
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
  }) as Model<LogInterface> & LogInterface

  if(!log) {
    return next(new ErrorResponse(`Unable to return site log by uuid ${ req.params.uuid }`, 500))
  }

  res.status(200).json({
    success: true,
    data: log
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

  const [affectedCount, affectedRows] = log

  if(affectedCount === 0) {
    return next(new ErrorResponse(`Unable to update log by uuid ${ req.params.uuid }`, 500))
  }

  const data = (affectedRows as (Model<LogInterface> & LogInterface)[])[0]

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
  const result = await Log.destroy({
    where: {
      uuid: req.params.uuid
    }
  })

  if(result === 0) {
    return next(new ErrorResponse(`Unable to delete site log by uuid ${ req.params.uuid }`, 500))
  }

  res.status(200).json({
    success: true,
    msg: "Site Log Deleted"
  })
})
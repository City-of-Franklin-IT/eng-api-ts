import { v4 as uuidv4 } from 'uuid'
import asyncHandler from '@middleware/async'
import { ErrorResponse } from '@utils/errorResponse'
import editorTracking from '@utils/editorTracking'
import { Log } from '@models/stormwater'

// Types
import { Request, Response, NextFunction } from 'express'
import { Model } from 'sequelize'
import { ControllerResponse } from '@controllers/types'
import * as Types from '@models/stormwater/types'

// @desc    Create log
// @route   POST /api/v2/stormwater/logs
// @access  Private
export const createLog = asyncHandler(async (req: Request<{}, {}, Types.LogCreationAttributes>, res: Response<ControllerResponse & { data: Types.LogInterface }>, next: NextFunction) => {
  const { siteId, inspectionDate } = req.body

  const log = await Log.create({
    logId: `log-${ uuidv4() }`,
    siteId,
    inspectionDate,
    ...editorTracking(req)
  }) as Model<Types.LogInterface> & Types.LogInterface

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
//@route   GET /api/v2/stormwater/logs/:uuid
//@access  Private
export const getLog = asyncHandler(async (req: Request<{ uuid: string }>, res: Response<ControllerResponse & { data: Types.LogInterface }>, next: NextFunction) => {
  const log = await Log.findOne({
    where: {
      uuid: req.params.uuid
    }
  }) as Model<Types.LogInterface> & Types.LogInterface

  if(!log) {
    return next(new ErrorResponse(`Unable to return site log by uuid ${ req.params.uuid }`, 500))
  }

  res.status(200).json({
    success: true,
    data: log
  })
})

// @desc    Update log
// @route   PUT /api/v2/stormwater/logs/:uuid
// @access  Private
export const updateLog = asyncHandler(async (req: Request<{ uuid: string }, {}, Types.LogCreationAttributes>, res: Response<ControllerResponse & { data: Types.LogInterface }>, next: NextFunction) => {
  const { inspectionDate } = req.body

  const log = await Log.update({
    inspectionDate,
    ...editorTracking(req)
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

  const data = (affectedRows as (Model<Types.LogInterface> & Types.LogInterface)[])[0]

  res.status(200).json({
    success: true,
    msg: "Site Log Updated",
    data
  })
})

// @desc    Delete log
// @route   DELETE /api/v2/stormwater/logs/:uuid
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
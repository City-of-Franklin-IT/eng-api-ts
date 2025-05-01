import { v4 as uuidv4 } from 'uuid'
import asyncHandler from '@middleware/async'
import { ErrorResponse } from '@utils/errorResponse'
import editorTracking from '@utils/editorTracking'
import { FollowUpDate } from '@models/stormwater'

// Types
import { Request, Response, NextFunction } from 'express'
import { Model } from 'sequelize'
import { ControllerResponse } from '@controllers/types'
import { FollowUpDateInterface } from '@models/stormwater/types'
import { CreateFollowUpDateRequest, CreateFollowUpDateResponse, UpdateFollowUpDateRequest, UpdateFollowUpDateResponse } from './types'

// @desc    Create follow up date
// @route   POST /api/v1/stormwater/followup
// @access  Private
export const createFollowUpDate = asyncHandler(async (req: Request<{}, {}, CreateFollowUpDateRequest>, res: Response<CreateFollowUpDateResponse>, next: NextFunction) => {
  const { parentId, followUpDate } = req.body

  const type = parentId.split('-')[0]

  const date = await FollowUpDate.create({
    followUpId: `follow-${ uuidv4() }`,
    violationId: type === 'violation' ? parentId : null,
    complaintId: type === 'complaint' ? parentId : null,
    illicitId: type === 'illicit' ? parentId : null,
    greenId: type === 'green' ? parentId : null,
    followUpDate,
    ...editorTracking(req)
  }) as Model<FollowUpDateInterface> & FollowUpDateInterface

  if(!date) {
    return next(new ErrorResponse("Unable to create follow up date", 500))
  }

  res.status(201).json({
    success: true,
    msg: "Follow Up Created",
    data: date
  })
})

// @desc    Update follow up date
// @route   PUT /api/v1/stormwater/followup/:uuid
// @access  Private
export const updateFollowUpDate = asyncHandler(async (req: Request<{ uuid: string }, {}, UpdateFollowUpDateRequest>, res: Response<UpdateFollowUpDateResponse>, next: NextFunction) => {
  const { followUpDate } = req.body

  const date = await FollowUpDate.update({
    followUpDate,
    ...editorTracking(req)
  },{
    where: {
      uuid: req.params.uuid
    },
    returning: true
  })

  const [affectedCount, affectedRows] = date

  if(affectedCount === 0) {
    return next(new ErrorResponse(`Unable to update follow up date by uuid ${ req.params.uuid }`, 500))
  }

  const data = (affectedRows as (Model<FollowUpDateInterface> & FollowUpDateInterface)[])[0]

  res.status(200).json({
    success: true,
    msg: "Followup Updated",
    data
  })
})

// @desc    Delete follow up date
// @route   DELETE /api/v1/stormwater/followup/:uuid
// @access  Private
export const deleteFollowUpDate = asyncHandler(async (req: Request<{ uuid: string }>, res: Response<ControllerResponse>, next: NextFunction) => {
  const result = await FollowUpDate.destroy({
    where: {
      uuid: req.params.uuid
    }
  })

  if(result === 0) {
    return next(new ErrorResponse(`Unable to delete follow up date by uuid ${ req.params.uuid }`, 500))
  }

  res.status(200).json({
    success: true,
    msg: "Follow Up Deleted"
  })
})
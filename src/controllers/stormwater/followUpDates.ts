import { nanoid } from 'nanoid'
import asyncHandler from '@middleware/async'
import { ErrorResponse } from '@utils/errorResponse'
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

  const email = req.user?.email

  const type = parentId.split('-')[0]

  const date = await FollowUpDate.create({
    followUpId: `follow-${ nanoid() }`,
    violationId: type === 'violation' ? parentId : null,
    complaintId: type === 'complaint' ? parentId : null,
    illicitId: type === 'illicit' ? parentId : null,
    greenId: type === 'green' ? parentId : null,
    followUpDate,
    createdBy: email,
    updatedBy: email,
  }) as Model<FollowUpDateInterface>

  if(!date) {
    return next(new ErrorResponse("Could not create follow up date", 500))
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

  const email = req.user?.email

  const date = await FollowUpDate.update({
    followUpDate,
    updatedBy: email
  },{
    where: {
      uuid: req.params.uuid
    },
    returning: true
  })

  if(!date) {
    return next(new ErrorResponse("Could not updated follow up date", 500))
  }

  const data = date[1] as Model<FollowUpDateInterface>[]

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
  await FollowUpDate.destroy({
    where: {
      uuid: req.params.uuid
    }
  })

  res.status(200).json({
    success: true,
    msg: "Follow Up Deleted"
  })
})
import asyncHandler from '@middleware/async'
import { ErrorResponse } from '@utils/errorResponse'
import editorTracking from '@utils/editorTracking'
import { Approval } from '@models/vesting'

// Types
import { Request, Response, NextFunction } from 'express'
import { Model } from 'sequelize'
import { ControllerResponse } from '@controllers/types'
import * as Types from '@models/vesting/types'

//@desc    Create project approval
//@route   POST /api/v2/eng/vesting/approval
//@access  Private
export const createApproval = asyncHandler(async (req: Request<{}, {}, Types.ApprovalCreationAttributes>, res: Response<ControllerResponse & { data: Types.ApprovalInterface }>) => {
  const { date, approvedBy, parentId } = req.body

  const approval = await Approval.create({
    date,
    approvedBy,
    parentId,
    ...editorTracking(req)
  }) as Model<Types.ApprovalInterface> & Types.ApprovalInterface

  res.status(201).json({
    success: true,
    msg: "Project Approval Created",
    data: approval
  })
})

//@desc    Update project approval
//@route   PUT /api/v2/eng/vesting/approval/:uuid
//@access  Private
export const updateApproval = asyncHandler(async (req: Request<{ uuid: string }, {}, Types.ApprovalCreationAttributes>, res: Response<ControllerResponse & { data: Types.ApprovalInterface }>, next: NextFunction) => {
  const { date, approvedBy } = req.body

  const result = await Approval.update({
    date,
    approvedBy,
    ...editorTracking(req)
  },{
    where: {
      uuid: req.params.uuid
    },
    returning: true
  })

  const [affectedCount, affectedRows] = result

  if(affectedCount === 0) {
    return next(new ErrorResponse(`Unable to updated project approval by uuid ${ req.params.uuid }`, 404))
  }

  const data = affectedRows[0] as Model<Types.ApprovalInterface> & Types.ApprovalInterface

  res.status(200).json({
    success: true,
    msg: "Project Approval Updated",
    data
  })
})
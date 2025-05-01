import asyncHandler from '@middleware/async'
import { ErrorResponse } from '@utils/errorResponse'
import editorTracking from '@utils/editorTracking'
import { Approval } from '@models/vesting'

// Types
import { Request, Response, NextFunction } from 'express'
import { ControllerResponse } from '@controllers/types'
import { CreateApprovalRequest, UpdateApprovalRequest } from './types'

//@desc    Create project approval
//@route   POST /api/v1/eng/vesting/approval
//@access  Private
export const createApproval = asyncHandler(async (req: Request<{}, {}, CreateApprovalRequest>, res: Response<ControllerResponse>, next: NextFunction) => {
  const { date, approvedBy, parentId } = req.body

  const approval = await Approval.create({
    date,
    approvedBy,
    parentId,
    ...editorTracking(req)
  })

  if(!approval) {
    return next(new ErrorResponse(`Could not create new project approval`, 500))
  }

  res.status(201).json({
    success: true,
    msg: "Project Approval Created"
  })
})

//@desc    Update project approval
//@route   PUT /api/v1/eng/vesting/approval/:uuid
//@access  Private
export const updateApproval = asyncHandler(async (req: Request<{ uuid: string }, {}, UpdateApprovalRequest>, res: Response<ControllerResponse>, next: NextFunction) => {
  const { date, approvedBy } = req.body

  const approval = await Approval.update({
    date,
    approvedBy,
    ...editorTracking(req)
  },{
    where: {
      uuid: req.params.uuid
    }
  })

  if(!approval) {
    return next(new ErrorResponse(`Unable to update approval by uuid ${ req.params.uuid }`, 500))
  }

  res.status(200).json({
    success: true,
    msg: "Project Approval Updated"
  })
})

//@desc    Delete project approval
//@route   DELTE /api/v1/eng/vesting/approval/:uuid
//@access  Private
export const deleteApproval = asyncHandler(async (req: Request<{ uuid: string }>, res: Response<ControllerResponse>, next: NextFunction) => {
  const result = await Approval.destroy({
    where: {
      uuid: req.params.uuid
    }
  })

  if(result === 0) {
    return next(new ErrorResponse(`Unable to delete approval by uuid ${ req.params.uuid }`, 500))
  }

  res.status(200).json({
    success: true,
    msg: "Project Approval Deleted"
  })
})
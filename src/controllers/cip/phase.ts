import asyncHandler from '@middleware/async'
import { ErrorResponse } from '@utils/errorResponse'
import { Phase } from '@models/cip'

// Types
import { Request, Response, NextFunction } from 'express'
import { ControllerResponse } from '@controllers/types'
import { CreatePhaseRequest } from './types'

//@desc    Create project phase
//@route   POST /api/v1/eng/cip/phases
//@access  Private
export const createPhase = asyncHandler(async (req: Request<{}, {}, CreatePhaseRequest>, res: Response<ControllerResponse>, next: NextFunction) => {
  const { phase, parentId } = req.body

  const email = req.user?.email

  const result = await Phase.create({
    phase,
    parentId,
    createdBy: email,
    updatedBy: email
  })

  if(!result) {
    return next(new ErrorResponse('Could not create new project phase', 500))
  }

  res.status(201).json({
    success: true,
    msg: "Project Phase Created"
  })
})

//@desc    Delete project phase
//@route   DELETE /api/v1/eng/cip/phases/:uuid
//@access  Private
export const deletePhase = asyncHandler(async (req: Request, res: Response<ControllerResponse>, next: NextFunction) => {
  await Phase.destroy({
    where: {
      uuid: req.params.uuid
    }
  })

  res.status(200).json({
    success: true,
    msg: "Proect Phase Deleted"
  })
})
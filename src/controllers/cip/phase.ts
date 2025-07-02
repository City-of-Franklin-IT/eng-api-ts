import asyncHandler from '@middleware/async'
import { ErrorResponse } from '@utils/errorResponse'
import editorTracking from '@utils/editorTracking'
import { Phase } from '@models/cip'

// Types
import { Request, Response, NextFunction } from 'express'
import { ControllerResponse } from '@controllers/types'
import { CreatePhaseRequest } from './types'

//@desc    Create project phase
//@route   POST /api/v2/eng/cip/phase
//@access  Private
export const createPhase = asyncHandler(async (req: Request<{}, {}, CreatePhaseRequest>, res: Response<ControllerResponse>, next: NextFunction) => {
  const { phase, parentId } = req.body

  const result = await Phase.create({
    phase,
    parentId,
    ...editorTracking(req)
  })

  if(!result) {
    return next(new ErrorResponse('Unable to create new project phase', 500))
  }

  res.status(201).json({
    success: true,
    msg: "Project Phase Created"
  })
})

//@desc    Delete project phase
//@route   DELETE /api/v2/eng/cip/phase/:uuid
//@access  Private
export const deletePhase = asyncHandler(async (req: Request, res: Response<ControllerResponse>, next: NextFunction) => {
  const result = await Phase.destroy({
    where: {
      uuid: req.params.uuid
    }
  })

  if(result === 0) {
    return next(new ErrorResponse(`Unable to delete project phase by uuid ${ req.params.uuid }`, 500))
  }

  res.status(200).json({
    success: true,
    msg: "Proect Phase Deleted"
  })
})
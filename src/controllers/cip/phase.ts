import asyncHandler from '@middleware/async'
import { ErrorResponse } from '@utils/errorResponse'
import editorTracking from '@utils/editorTracking'
import { Phase } from '@models/cip'

// Types
import { Request, Response, NextFunction } from 'express'
import { Model } from 'sequelize'
import { ControllerResponse } from '@controllers/types'
import { PhaseInterface } from '@models/cip/types'
import { CreatePhaseRequest } from './types'

//@desc    Create project phase
//@route   POST /api/v2/eng/cip/phase
//@access  Private
export const createPhase = asyncHandler(async (req: Request<{}, {}, CreatePhaseRequest>, res: Response<ControllerResponse & { data: PhaseInterface }>) => {
  const { phase, parentId } = req.body

  const result = await Phase.create({
    phase,
    parentId,
    ...editorTracking(req)
  }) as Model<PhaseInterface> & PhaseInterface

  res.status(201).json({
    success: true,
    msg: "Project Phase Created",
    data: result
  })
})

//@desc    Update project phase
//@route   PUT /api/v2/eng/cip/phase/:uuid
//@access  Private
export const updatePhase = asyncHandler(async (req: Request<{ uuid: string }, CreatePhaseRequest>, res: Response<ControllerResponse & { data: PhaseInterface }>, next: NextFunction) => {
  const { phase } = req.body

  const result = await Phase.update({
    phase
  },{
    where: {
      uuid: req.params.uuid
    },
    returning: true
  })

  const [affectedCount, affectedRows] = result

  if(affectedCount === 0) {
    return next(new ErrorResponse(`Unable to update project phase by uuid ${ req.params.uuid }`, 404))
  }

  const data = affectedRows[0] as Model<PhaseInterface> & PhaseInterface

  res.status(200).json({
    success: true,
    msg: "Proect Phase Updated",
    data
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
    return next(new ErrorResponse(`Unable to delete project phase by uuid ${ req.params.uuid }`, 404))
  }

  res.status(200).json({
    success: true,
    msg: "Proect Phase Deleted"
  })
})
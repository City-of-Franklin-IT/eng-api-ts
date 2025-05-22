import asyncHandler from '@middleware/async'
import { ErrorResponse } from '@utils/errorResponse'
import editorTracking from '@utils/editorTracking'
import { Resolution } from '@models/vesting' 

// Types
import { Request, Response, NextFunction } from 'express'
import { ControllerResponse } from '@controllers/types'
import * as Types from '@models/vesting/types'

//@desc    Create resolution
//@route   POST /api/v1/eng/vesting/resolution
//@access  Private
export const createResolution = asyncHandler(async (req: Request<{}, {}, Types.ResolutionCreationAttributes>, res: Response<ControllerResponse>, next: NextFunction) => {
  const { resolution, parentId } = req.body

  const result = await Resolution.create({
    resolution,
    parentId,
    ...editorTracking(req)
  })

  if(!result) {
    return next(new ErrorResponse('Unable to create resolution', 500))
  }

  res.status(201).json({
    success: true,
    msg: 'Resolution Created'
  })
})

//@desc    Update resolution
//@route   PUT /api/v1/eng/vesting/resolution/:uuid
//@access  Private
export const updateResolution = asyncHandler(async (req: Request<{ uuid: string }, {}, Types.ResolutionCreationAttributes>, res: Response<ControllerResponse>, next: NextFunction) => {
  const { resolution } = req.body

  const result = await Resolution.update({
    resolution,
    ...editorTracking(req)
  },{
    where: {
      uuid: req.params.uuid
    }
  })

  const [affectedCount] = result

  if(affectedCount === 0) {
    return next(new ErrorResponse(`Unable to update resolution by uuid ${ req.params.uuid }`, 500))
  }

  res.status(200).json({
    success: true,
    msg: "Resolution Updated"
  })
})
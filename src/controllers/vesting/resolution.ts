import asyncHandler from '@middleware/async'
import { ErrorResponse } from '@utils/errorResponse'
import editorTracking from '@utils/editorTracking'
import { Resolution } from '@models/vesting' 

// Types
import { Request, Response, NextFunction } from 'express'
import { Model } from 'sequelize'
import { ControllerResponse } from '@controllers/types'
import * as Types from '@models/vesting/types'

//@desc    Create resolution
//@route   POST /api/v2/eng/vesting/resolution
//@access  Private
export const createResolution = asyncHandler(async (req: Request<{}, {}, Types.ResolutionCreationAttributes>, res: Response<ControllerResponse & { data: Types.ResolutionInterface }>) => {
  const { resolution, parentId } = req.body

  const result = await Resolution.create({
    resolution,
    parentId,
    ...editorTracking(req)
  }) as Model<Types.ResolutionInterface> & Types.ResolutionInterface

  res.status(201).json({
    success: true,
    msg: 'Resolution Created',
    data: result
  })
})

//@desc    Update resolution
//@route   PUT /api/v2/eng/vesting/resolution/:uuid
//@access  Private
export const updateResolution = asyncHandler(async (req: Request<{ uuid: string }, {}, Types.ResolutionCreationAttributes>, res: Response<ControllerResponse & { data: Types.ResolutionInterface }>, next: NextFunction) => {
  const { resolution } = req.body

  const result = await Resolution.update({
    resolution,
    ...editorTracking(req)
  },{
    where: {
      uuid: req.params.uuid
    },
    returning: true
  })

  const [affectedCount, affectedRows] = result

  if(affectedCount === 0) {
    return next(new ErrorResponse(`Unable to update resolution by uuid ${ req.params.uuid }`, 404))
  }

  const data = affectedRows[0] as Model<Types.ResolutionInterface> & Types.ResolutionInterface

  res.status(200).json({
    success: true,
    msg: "Resolution Updated",
    data
  })
})
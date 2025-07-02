import asyncHandler from '@middleware/async'
import { ErrorResponse } from '@utils/errorResponse'
import editorTracking from '@utils/editorTracking'
import { Update } from '@models/cip'

// Types
import { Request, Response, NextFunction } from 'express'
import { Model } from 'sequelize'
import { UpdateInterface } from '@models/cip/types'
import { ControllerResponse } from '@controllers/types'
import { CreateProjectUpdateRequest, UpdateProjectUpdateRequest } from './types'

//@desc    Create project update
//@route   POST /api/v2/eng/cip/update
//@access  Private
export const createUpdate = asyncHandler(async (req: Request<{}, {}, CreateProjectUpdateRequest>, res: Response<ControllerResponse>, next: NextFunction) => {
  const { projectUpdate, parentId } = req.body

  const update = await Update.create({
    projectUpdate,
    parentId,
    ...editorTracking(req)
  }) as Model<UpdateInterface>

  if(!update) {
    return next(new ErrorResponse('Unable to create project update', 500))
  }

  res.status(200).json({
    success: true,
    msg: "Project Update Created"
  })
})

//@desc    Update project update
//@route   PUT /api/v2/eng/cip/update/:uuid
//@access  Private
export const updateUpdate = asyncHandler(async (req: Request<{ uuid: string }, {}, UpdateProjectUpdateRequest>, res: Response<ControllerResponse>, next: NextFunction) => {
  const { projectUpdate } = req.body

  const update = await Update.update({
    projectUpdate,
    ...editorTracking(req)
  },{
    where: {
      uuid: req.params.uuid
    }
  })

  if(!update) {
    return next(new ErrorResponse(`Unable to update project update by uuid ${ req.params.uuid }`, 500))
  }

  res.status(200).json({
    success: true,
    msg: "Project Update Updated"
  })
})

//@desc    Delete project update
//@route   DELETE /api/v2/eng/cip/update/:uuid
//@access  Private
export const deleteUpdate = asyncHandler(async (req: Request<{ uuid: string }>, res: Response<ControllerResponse>, next: NextFunction) => {
  const result = await Update.destroy({
    where: {
      uuid: req.params.uuid
    }
  })

  if(result === 0) {
    return next(new ErrorResponse(`Unable to delete project update by uuid ${ req.params.uuid }`, 500))
  }

  res.status(200).json({
    success: true,
    msg: "Project Update Deleted"
  })
})
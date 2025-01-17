import asyncHandler from '@middleware/async'
import { ErrorResponse } from '@utils/errorResponse'
import { Update } from '@models/cip'

// Types
import { Request, Response, NextFunction } from 'express'
import { Model } from 'sequelize'
import { UpdateInterface } from '@models/cip/types'
import { ControllerResponse } from '@controllers/types'
import { CreateProjectUpdateRequest, UpdateProjectUpdateRequest } from './types'

//@desc    Create project update
//@route   POST /api/v1/eng/cip/updates
//@access  Private
export const createUpdate = asyncHandler(async (req: Request<{}, {}, CreateProjectUpdateRequest>, res: Response<ControllerResponse>, next: NextFunction) => {
  const { projectUpdate, parentId } = req.body

  const email = req.user?.email

  const update = await Update.create({
    projectUpdate,
    parentId,
    createdBy: email,
    updatedBy: email
  }) as Model<UpdateInterface>

  if(!update) {
    return next(new ErrorResponse('Could not create project update', 500))
  }

  res.status(200).json({
    success: true,
    msg: "Project Update Created"
  })
})

//@desc    Update project update
//@route   PUT /api/v1/eng/cip/updates/:uuid
//@access  Private
export const updateUpdate = asyncHandler(async (req: Request<{ uuid: string }, {}, UpdateProjectUpdateRequest>, res: Response<ControllerResponse>, next: NextFunction) => {
  const { projectUpdate } = req.body

  const email = req.user?.email

  const update = await Update.update({
    projectUpdate,
    updatedBy: email
  },{
    where: {
      uuid: req.params.uuid
    }
  })

  if(!update) {
    return next(new ErrorResponse(`Could not update project update by uuid ${ req.params.uuid }`, 500))
  }

  res.status(200).json({
    success: true,
    msg: "Project Update Updated"
  })
})

//@desc    Delete project update
//@route   DELETE /api/v1/eng/cip/updates/:uuid
//@access  Private
export const deleteUpdate = asyncHandler(async (req: Request<{ uuid: string }>, res: Response<ControllerResponse>, next: NextFunction) => {
  await Update.destroy({
    where: {
      uuid: req.params.uuid
    }
  })

  res.status(200).json({
    success: true,
    msg: "Project Update Deleted"
  })
})
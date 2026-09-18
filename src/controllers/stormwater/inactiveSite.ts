import asyncHandler from '@middleware/async'
import { ErrorResponse } from '@utils/errorResponse'
import editorTracking from '@utils/editorTracking'
import { InactiveSite } from '@models/stormwater'

// Types
import { Request, Response, NextFunction } from 'express'
import { Model } from 'sequelize'
import { ControllerResponse } from '@controllers/types'
import * as Types from '@models/stormwater/types'

//@desc    Create inactive site
//@route   POST /api/v2/stormwater/inactive
//@access  Private
export const createInactiveSite = asyncHandler(async (req: Request<{}, {}, { siteId: string }>, res: Response<ControllerResponse & { data: Types.InactiveSiteInterface }>, next: NextFunction) => {

  const result = await InactiveSite.create({
    ...req.body,
    ...editorTracking(req)
  }) as Model<Types.InactiveSiteInterface> & Types.InactiveSiteInterface

  res.status(201).json({
    success: true,
    msg: "Inactive Site Created",
    data: result
  })
})

// @desc    Delete inactive site
// @route   DELETE /api/v2/stormwater/inactive/:uuid
// @access  Private
export const deleteInactiveSite = asyncHandler(async (req: Request<{ uuid: string }>, res: Response, next: NextFunction) => {
  const result = await InactiveSite.destroy({
    where: {
      uuid: req.params.uuid
    }
  })

  if(result === 0) {
    return next(new ErrorResponse(`Unable to delete inactive site by uuid ${ req.params.uuid }`, 404))
  }

  res.status(200).json({
    success: true,
    msg: "Inactive Site Deleted"
  })
})
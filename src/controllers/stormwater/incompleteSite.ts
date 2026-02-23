import asyncHandler from '@middleware/async'
import { ErrorResponse } from '@utils/errorResponse'
import editorTracking from '@utils/editorTracking'
import { IncompleteSite } from '@models/stormwater'

// Types
import { Request, Response, NextFunction } from 'express'
import { Model } from 'sequelize'
import { ControllerResponse } from '@controllers/types'
import * as Types from '@models/stormwater/types'

//@desc    Create incomplete site
//@route   POST /api/v2/stormwater/incomplete
//@access  Private
export const createIncompleteSite = asyncHandler(async (req: Request<{}, {}, { siteId: string }>, res: Response<ControllerResponse & { data: Types.IncompleteSiteInterface }>, next: NextFunction) => {

  const result = await IncompleteSite.create({
    ...req.body,
    ...editorTracking(req)
  }) as Model<Types.IncompleteSiteInterface> & Types.IncompleteSiteInterface

  if(!result) {
    return next(new ErrorResponse("Unable to create incomplete site", 500))
  }

  res.status(201).json({
    success: true,
    msg: "Incomplete Site Created",
    data: result
  })
})

// @desc    Delete incomplete site
// @route   DELETE /api/v2/stormwater/incomplete/:uuid
// @access  Private
export const deleteIncompleteSite = asyncHandler(async (req: Request<{ uuid: string }>, res: Response, next: NextFunction) => {
  const result = await IncompleteSite.destroy({
    where: {
      uuid: req.params.uuid
    }
  })

  if(result === 0) {
    return next(new ErrorResponse(`Unable to delete incomplete site by uuid ${ req.params.uuid }`, 500))
  }

  res.status(200).json({
    success: true,
    msg: "Incomplete Site Deleted"
  })
})
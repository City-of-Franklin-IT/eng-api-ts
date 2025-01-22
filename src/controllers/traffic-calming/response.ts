import asyncHandler from '@middleware/async'
import { ErrorResponse } from '@utils/errorResponse'
import { Respondent, Response as PetitionResponse } from '@models/traffic-calming'

// Types
import { Request, Response, NextFunction } from 'express'
import { Model } from 'sequelize'
import { ResponseInterface } from '@models/traffic-calming/types'
import { CreateResponseRequest, CreateResponseResponse } from './types'

//@desc    Create response
//@route   POST /api/v1/eng/traffic-calming/response
//@access  Public
export const createResponse = asyncHandler(async (req: Request<{}, {}, CreateResponseRequest>, res: Response<CreateResponseResponse>, next: NextFunction) => {
  const { response, parentId, shortId } = req.body

  const validate = async () => {
    const respondent = await Respondent.count({
      where: {
        shortId
      }
    })

    if(respondent === 0) { // Respondent not found in database
      return false
    }

    return true
  }

  const isValid = await validate()

  if(!isValid) { // If respondent is not valid - return error
    return next(new ErrorResponse(`Unable to verify respondent id ${ shortId }`, 500))
  }

  const result = await PetitionResponse.create({
    response,
    parentId
  }) as Model<ResponseInterface>

  if(!result) {
    return next(new ErrorResponse("Unable to create petition response", 500))
  }

  res.status(201).json({
    success: true,
    msg: 'Petition Response Saved',
    data: result
  })
})
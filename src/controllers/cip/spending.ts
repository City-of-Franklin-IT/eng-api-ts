import asyncHandler from '@middleware/async'
import { ErrorResponse } from '@utils/errorResponse'
import { Spending } from '@models/cip'

// Types
import { Request, Response, NextFunction } from 'express'
import { Model } from 'sequelize'
import { SpendingInterface } from '@models/cip/types'
import { ControllerResponse } from '@controllers/types'
import { CreateSpendingRequest } from './types'

//@desc    Create spending
//@route   POST /api/v1/eng/cip/spending
//@access  Private
export const createSpending = asyncHandler(async (req: Request<{}, {}, CreateSpendingRequest>, res: Response<ControllerResponse>, next: NextFunction) => {
  const { dollarsSpent, parentId } = req.body

  const email = req.user?.email

  const spending = await Spending.create({
    dollarsSpent,
    dollarsSpentDate: new Date(),
    parentId,
    createdBy: email,
    updatedBy: email
  }) as Model<SpendingInterface>

  if(!spending) {
    return next(new ErrorResponse('Could not create new spending', 500))
  }

  res.status(201).json({
    success: true,
    msg: "Spending Created"
  })
})

//@desc    Delete spending
//@route   DELETE /api/v1/eng/cip/spending/:uuid
//@access  Private
export const deleteSpending = asyncHandler(async (req: Request<{ uuid: string }>, res: Response<ControllerResponse>, next: NextFunction) => {
  await Spending.destroy({
    where: {
      uuid: req.params.uuid
    }
  })

  res.status(200).json({
    success: true,
    msg: "Spending Deleted"
  })
})
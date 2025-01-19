import { nanoid } from 'nanoid'
import asyncHandler from '@middleware/async'
import { ErrorResponse } from '@utils/errorResponse'
import { ConstructionViolation, Site, FollowUpDate } from '@models/stormwater'

// Types
import { Request, Response, NextFunction } from 'express'
import { Model } from 'sequelize'
import { ControllerResponse } from '@controllers/types'
import { ConstructionViolationInterface } from '@models/stormwater/types'
import { CreateConstructionViolationRequest, CreateConstructionViolationResponse, GetConstructionViolationsResponse, GetConstructionViolationResponse, UpdateConstructionViolationRequest, UpdateConstructionViolationResponse } from './types'

// @desc    Create construction violation
// @route   POST /api/v1/stormwater/violations
// @access  Private
export const createViolation = asyncHandler(async (req: Request<{}, {}, CreateConstructionViolationRequest>, res: Response<CreateConstructionViolationResponse>, next: NextFunction) => {
  const { date, siteId, details, complaintId } = req.body

  const email = req.user?.email

  const violation = await ConstructionViolation.create({
    violationId: `violation-${ nanoid() }`,
    date,
    siteId,
    details,
    complaintId,
    createdBy: email,
    updatedBy: email
  }) as Model<ConstructionViolationInterface> & ConstructionViolationInterface
  
  if(!violation) {
    return next(new ErrorResponse("Could not create construction violation", 500))
  }
  
  res.status(201).json({
    success: true,
    msg: "Violation Created",
    data: violation
  })
})

// @desc    Get violations
// @route   GET /api/v1/stormwater/violations
// @access  Private
export const getViolations = asyncHandler(async (req: Request, res: Response<GetConstructionViolationsResponse>, next: NextFunction) => {

  const violations = await ConstructionViolation.findAll({
    order: [[Site, 'name', 'asc'], [FollowUpDate, 'followUpDate', 'desc']],
    include: [{ model: Site }, { model: FollowUpDate }]
  }) as Model<ConstructionViolationInterface>[] & ConstructionViolationInterface

  if(!violations) {
    return next(new ErrorResponse("Could not return construction vioaltions", 500))
  }

  res.status(200).json({
    success: true,
    data: violations
  })
})

// @desc    Get violation
// @route   GET /api/v1/stormwater/violations/:uuid
// @access  Private
export const getViolation = asyncHandler(async (req: Request<{ uuid: string }>, res: Response<GetConstructionViolationResponse>, next: NextFunction) => {
  const violation = await ConstructionViolation.findOne({
    where: {
      uuid: req.params.uuid
    },
    order: [[FollowUpDate, 'followUpDate', 'desc']],
    include: { model: FollowUpDate }
  }) as Model<ConstructionViolationInterface> & ConstructionViolationInterface

  if(!violation) {
    return next(new ErrorResponse(`Could not return construction violation with uuid ${ req.params.uuid }`, 500))
  }

  res.status(200).json({
    success: true,
    data: violation
  })
})

// @desc    Update violation
// @route   PUT /api/v1/stormwater/violations/:uuid
// @access  Private
export const updateViolation = asyncHandler(async (req: Request<{ uuid: string }, {}, UpdateConstructionViolationRequest>, res: Response<UpdateConstructionViolationResponse>, next: NextFunction) => {
  const { date, siteId, details, enforcementAction, penaltyDate, penaltyAmount, penaltyDueDate, paymentReceived, swoDate, swoLiftedDate, compliance, closed } = req.body

  const email = req.user?.email

  const violation = await ConstructionViolation.update({
    date,
    siteId,
    details,
    enforcementAction,
    penaltyDate: penaltyDate ?? null,
    penaltyAmount,
    penaltyDueDate: penaltyDueDate ?? null,
    paymentReceived: paymentReceived ?? null,
    swoDate: swoDate ?? null,
    swoLiftedDate: swoLiftedDate ?? null,
    compliance,
    closed,
    updatedBy: email,
  },
  {
    where: {
      uuid: req.params.uuid
    },
    returning: true
  })
  
  if(!violation) {
    return next(new ErrorResponse(`Could not update construction violation with uuid ${ req.params.uuid }`, 500))
  }

  const data = violation[1] as Model<ConstructionViolationInterface>[] & ConstructionViolationInterface

  res.status(200).json({
    success: true,
    msg: "Violation Updated",
    data
  })
})

// @desc    Delete violation
// @route   DELETE /api/v1/stormwater/violations/:uuid
// @access  Private
export const deleteViolation = asyncHandler(async (req: Request<{ uuid: string }>, res: Response<ControllerResponse>, next: NextFunction) => {
  await ConstructionViolation.destroy({
    where: {
      uuid: req.params.uuid
    }
  })

  res.status(200).json({
    success: true,
    msg: "Violation Deleted"
  })
})
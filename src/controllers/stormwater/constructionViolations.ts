import { nanoid } from 'nanoid'
import asyncHandler from '@middleware/async'
import { ErrorResponse } from '@utils/errorResponse'
import { ConstructionViolation, Site, FollowUpDate } from '@models/stormwater'

// Types
import { Request, Response, NextFunction } from 'express'
import { Model } from 'sequelize'
import { ControllerResponse } from '@controllers/types'
import { CreateConstructionViolationRequest, CreateConstructionViolationResponse, GetConstructionViolationsResponse, GetConstructionViolationResponse } from './types'
import { ConstructionViolationInterface } from '@models/stormwater/types'

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
exports.updateViolation = asyncHandler(async (req, res, next) => {
  const { date, siteId, details, enforcementAction, penaltyDate, penaltyAmount, penaltyDueDate, paymentReceived, swoDate, swoLiftedDate, compliance, closed, updatedAt } = req.body

  const production = process.env.NODE_ENV === 'production'

  const email = handleUserEmail(production, req)

  const violation = await ConstructionViolations.update({
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
    updatedAt
  },
  {
    where: {
      uuid: req.params.uuid
    },
    returning: true,
    plain: true
  })
  
  if(!violation) {
    return next(new ErrorResponse(`Could not update construction violation with uuid ${ req.params.uuid }`, 500))
  }

  await Complaints.update({
    closed
  },{
    where: {
      complaintId: violation[1].complaintId
    }
  })

  production && req.log.info(`ACTION - ${ email } updated a construction violation`)

  res.status(200).json({
    success: true,
    msg: "Violation Updated",
    data: violation[1]
  })
})

// @desc    Delete violation
// @route   DELETE /api/v1/stormwater/violations/:uuid
// @access  Private
exports.deleteViolation = asyncHandler(async (req, res, next) => {
  await ConstructionViolations.destroy({
    where: {
      uuid: req.params.uuid
    }
  })

  const production = process.env.NODE_ENV === 'production'

  production && req.log.info(`ACTION - ${ req.user.email } deleted a construction violation`)

  res.status(200).json({
    success: true,
    msg: "Violation Deleted"
  })
})
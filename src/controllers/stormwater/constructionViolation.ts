import { v4 as uuidv4 } from 'uuid'
import asyncHandler from '@middleware/async'
import { ErrorResponse } from '@utils/errorResponse'
import editorTracking from '@utils/editorTracking'
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

  const violation = await ConstructionViolation.create({
    violationId: `violation-${ uuidv4() }`,
    date,
    siteId,
    details,
    complaintId,
    ...editorTracking(req)
  }) as Model<ConstructionViolationInterface> & ConstructionViolationInterface
  
  if(!violation) {
    return next(new ErrorResponse("Unable to create construction violation", 500))
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
    include: [
      { model: Site }, 
      { model: FollowUpDate }
    ]
  }) as (Model<ConstructionViolationInterface> & ConstructionViolationInterface)[]

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
    return next(new ErrorResponse(`Unable to return construction violation by uuid ${ req.params.uuid }`, 500))
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

  const violation = await ConstructionViolation.update({
    date,
    siteId,
    details,
    enforcementAction,
    penaltyDate: penaltyDate,
    penaltyAmount,
    penaltyDueDate: penaltyDueDate,
    paymentReceived: paymentReceived,
    swoDate: swoDate,
    swoLiftedDate: swoLiftedDate,
    compliance,
    closed,
    ...editorTracking(req)
  },
  {
    where: {
      uuid: req.params.uuid
    },
    returning: true
  })

  const [affectedCount, affectedRows] = violation
  
  if(affectedCount === 0) {
    return next(new ErrorResponse(`Unable to update construction violation by uuid ${ req.params.uuid }`, 500))
  }

  const data = (affectedRows as (Model<ConstructionViolationInterface> & ConstructionViolationInterface)[])[0]

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
  const result = await ConstructionViolation.destroy({
    where: {
      uuid: req.params.uuid
    }
  })

  if(result === 0) {
    return next(new ErrorResponse(`Unable to delete violation by uuid ${ req.params.uuid }`, 500))
  }

  res.status(200).json({
    success: true,
    msg: "Violation Deleted"
  })
})
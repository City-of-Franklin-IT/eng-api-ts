import { v4 as uuidv4 } from 'uuid'
import asyncHandler from '@middleware/async'
import { ErrorResponse } from '@utils/errorResponse'
import editorTracking from '@utils/editorTracking'
import { GreenInfrastructure, Inspector, FollowUpDate } from '@models/stormwater'
import { emailInspector, inspectorLookup } from '@utils/automatedEmails/emailInspector'

// Types
import { Request, Response, NextFunction } from 'express'
import { Model } from 'sequelize'
import { ControllerResponse } from '@controllers/types'
import { GreenInfrastructureInterface, InspectorInterface } from '@models/stormwater/types'
import { CreateGreenInfrastructureRequest, CreateGreenInfrastructureResponse, GetGreenInfrasturcturesResponse, GetGreenInfrasturctureResponse, UpdateGreenInfrastructureRequest, UpdateGreenInfrastructureResponse } from './types'

// @desc    Create green infrastructure violation
// @route   POST /api/v1/stormwater/greeninfrastructure
// @access  Private
export const createGreenInfrastructure = asyncHandler(async (req: Request<{}, {}, CreateGreenInfrastructureRequest>, res: Response<CreateGreenInfrastructureResponse>, next: NextFunction) => {
  const { date, xCoordinate, yCoordinate, locationDescription, inspectorId, details, comments, responsibleParty, enforcementAction, penaltyDate, penaltyAmount, penaltyDueDate, paymentReceived } = req.body

  const production = process.env.NODE_ENV === 'production'

  const green = await GreenInfrastructure.create({
    greenId: `green-${ uuidv4() }`,
    date,
    xCoordinate,
    yCoordinate,
    locationDescription,
    inspectorId,
    details,
    comments,
    responsibleParty,
    enforcementAction,
    penaltyDate,
    penaltyAmount,
    penaltyDueDate,
    paymentReceived,
    ...editorTracking(req)
  }) as Model<GreenInfrastructureInterface> & GreenInfrastructureInterface

  if(!green) {
    return next (new ErrorResponse("Could not create green infrastructure violation", 500))
  }

  if(inspectorId && production) { // If inspector assigned - email inspector
    const inspector = await Inspector.findOne({
      where: {
        inspectorId
      },
      attributes: ['email']
    }) as Model<InspectorInterface> & InspectorInterface

    if(inspector) {
      await emailInspector(inspector.email, { uuid: green.uuid, greenId: green.greenId, details: green.details })
    }
  }

  res.status(201).json({
    success: true,
    msg: "Green Infrastructure Violation Created",
    data: green
  })
})

// @desc    Get green infrastructure violations
// @route   GET /api/v1/stormwater/greeninfrastructure
// @access  Private
export const getGreenInfrastructures = asyncHandler(async (req: Request, res: Response<GetGreenInfrasturcturesResponse>, next: NextFunction) => {
  const greenViolations = await GreenInfrastructure.findAll({
    order: [['date', 'desc'], [FollowUpDate, 'followUpDate', 'desc']],
    include: { model: FollowUpDate }
  }) as (Model<GreenInfrastructureInterface> & GreenInfrastructureInterface)[]

  res.status(200).json({
    success: true,
    data: greenViolations
  })
})

// @desc    Get green infrastructure
// @route   GET /api/v1/stormwater/greeninfrastructure/:uuid
// @access  Private
export const getGreenInfrastructure = asyncHandler(async (req: Request<{ uuid: string }>, res: Response<GetGreenInfrasturctureResponse>, next: NextFunction) => {
  const green = await GreenInfrastructure.findOne({
    where: {
      uuid: req.params.uuid
    },
    order: [[FollowUpDate, 'followUpDate', 'desc']],
    include: { model: FollowUpDate }
  }) as Model<GreenInfrastructureInterface> & GreenInfrastructureInterface

  if(!green) {
    return next(new ErrorResponse(`Unable to return green infrastructure violation by uuid ${ req.params.uuid }`, 500))
  }

  res.status(200).json({
    success: true,
    data: green
  })
})

// @desc    Update green infrastructure violation
// @route   PUT /api/v1/stormwater/greeninfrastructure/:uuid
// @access  Private
export const updateGreenInfrastructure = asyncHandler(async (req: Request<{ uuid: string }, {}, UpdateGreenInfrastructureRequest>, res: Response<UpdateGreenInfrastructureResponse>, next: NextFunction) => {
  const { date, xCoordinate, yCoordinate, locationDescription, inspectorId, details, comments, responsibleParty, enforcementAction, penaltyDate, penaltyAmount, penaltyDueDate, paymentReceived, bondReleased, compliance, closed } = req.body

  const production = process.env.NODE_ENV === 'production'

  const inspectorEmail = await inspectorLookup(req.params.uuid, GreenInfrastructure, inspectorId)

  const green = await GreenInfrastructure.update({
    date,
    xCoordinate,
    yCoordinate,
    locationDescription,
    inspectorId,
    details,
    comments,
    responsibleParty,
    enforcementAction,
    penaltyDate,
    penaltyAmount,
    penaltyDueDate,
    paymentReceived,
    bondReleased,
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

  const [affectedCount, affectedRows] = green

  if(affectedCount === 0) {
    return next(new ErrorResponse(`Unable to update green infrastructure with uuid ${ req.params.uuid }`, 500))
  }

  const data = (affectedRows as (Model<GreenInfrastructureInterface> & GreenInfrastructureInterface)[])[0]

  if(inspectorEmail && inspectorId && production) { // If inspector assigned - email inspector
    await emailInspector(inspectorEmail.email, { uuid: data.uuid, greenId: data.greenId, details: data.details })
  }

  res.status(200).json({
    success: true,
    msg: "Violation Updated",
    data
  })
})

// @desc    Delete green infrastructure violation
// @route   DELETE /api/v1/stormwater/greeninfrastructure/:uuid
// @access  Private
export const deleteGreenInfrastructure = asyncHandler(async (req: Request<{ uuid: string }>, res: Response<ControllerResponse>, next: NextFunction) => {
  const result = await GreenInfrastructure.destroy({
    where: {
      uuid: req.params.uuid
    }
  })

  if(result === 0) {
    return next(new ErrorResponse(`Unable to delete green infrastructure by uuid ${ req.params.uuid }`, 500))
  }

  res.status(200).json({
    success: true,
    msg: "Violation Deleted"
  })
})
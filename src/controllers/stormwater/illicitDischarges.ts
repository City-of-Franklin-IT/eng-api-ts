import { v4 as uuidv4 } from 'uuid'
import asyncHandler from '@middleware/async'
import { ErrorResponse } from '@utils/errorResponse'
import { IllicitDischarge, Inspector, FollowUpDate } from '@models/stormwater'
import { emailInspector, inspectorLookup } from '@utils/automatedEmails/emailInspector'

// Types
import { Request, Response, NextFunction } from 'express'
import { Model } from 'sequelize'
import { ControllerResponse } from '@controllers/types'
import { IllicitDischargeInterface, InspectorInterface } from '@models/stormwater/types'
import { CreateIllicitDischargeRequest, CreateIllicitDischargeResponse, GetIllicitDischargesResponse, GetIllicitDischargeResponse, UpdateIllicitDischargeRequest, UpdateIllicitDischargeResponse } from './types'

// @desc    Create illicit discharge
// @route   POST /api/v1/stormwater/illicit-discharges/create
// @access  Private
export const createIllicitDischarge = asyncHandler(async (req: Request<{}, {}, CreateIllicitDischargeRequest>, res: Response<CreateIllicitDischargeResponse>, next: NextFunction) => {
  const { complaintId, siteId, date, xCoordinate, yCoordinate, locationDescription, inspectorId, details, responsibleParty, volumeLost, streamWatershed, otherStreamWatershed, enforcementAction, penaltyDate, penaltyAmount, penaltyDueDate, paymentReceived } = req.body

  const production = process.env.NODE_ENV === 'production'

  const email = req.user?.email

  const illicit = await IllicitDischarge.create({
    illicitId: `illicit-${ uuidv4() }`,
    complaintId,
    siteId,
    date: new Date(date),
    xCoordinate,
    yCoordinate,
    locationDescription,
    inspectorId,
    details,
    responsibleParty,
    volumeLost,
    streamWatershed: otherStreamWatershed ? otherStreamWatershed : streamWatershed,
    enforcementAction,
    penaltyDate,
    penaltyAmount,
    penaltyDueDate,
    paymentReceived,
    createdBy: email,
    updatedBy: email
  }) as Model<IllicitDischargeInterface> & IllicitDischargeInterface
    
  if(!illicit) {
    return next(new ErrorResponse("Unable to create illicit discharge", 500))
  }

  if(inspectorId && production) { // If inspector assigned - email inspector
    const inspector = await Inspector.findOne({
      where: {
        inspectorId
      },
      attributes: ['email']
    }) as Model<InspectorInterface> & InspectorInterface

    if(inspector) {
      await emailInspector(inspector.email, { uuid: illicit.uuid, details: illicit.details })
    }
  }
    
  res.status(201).json({
    success: true,
    msg: "Illicit Discharge Created",
    data: illicit
  })
})

// @desc    Get illicit discharges - no associated site
// @route   GET /api/v1/stormwater/illicitdischarges
// @access  Private
export const getIllicitDischarges = asyncHandler(async (req: Request, res: Response<GetIllicitDischargesResponse>, next: NextFunction) => {
  const illicitDischarges = await IllicitDischarge.findAll({
    where: {
      siteId: null
    },
    order: [['date', 'desc'], [FollowUpDate, 'followUpDate', 'desc']],
    include: [
      { model: FollowUpDate }
    ]
  }) as (Model<IllicitDischargeInterface> & IllicitDischargeInterface)[]

  res.status(200).json({
    success: true,
    data: illicitDischarges
  })
})

// @desc    Get illicit discharge
// @route   GET /api/v1/stormwater/illicit-discharges/:uuid
// @access  Private
export const getIllicitDischarge = asyncHandler(async (req: Request<{ uuid: string }>, res: Response<GetIllicitDischargeResponse>, next: NextFunction) => {
  const illicit = await IllicitDischarge.findOne({
    where: {
      uuid: req.params.uuid
    },
    order: [[FollowUpDate, 'followUpDate', 'desc']],
    include: {
      model: FollowUpDate
    }
  }) as Model<IllicitDischargeInterface>

  if(!illicit) {
    return next(new ErrorResponse(`Unable to return illicit discharge by uuid ${ req.params.uuid }`, 500))
  }

  res.status(200).json({
    success: true,
    data: illicit
  })
})

// @desc    Update illicit discharge
// @route   PUT /api/v1/stormwater/illicit-discharges/:uuid
// @access  Private
export const updateIllicitDischarge = asyncHandler(async (req: Request<{ uuid: string },{}, UpdateIllicitDischargeRequest>, res: Response<UpdateIllicitDischargeResponse>, next: NextFunction) => {
  const { date, xCoordinate, yCoordinate, locationDescription, inspectorId, details, responsibleParty, volumeLost, streamWatershed, otherStreamWatershed, enforcementAction, penaltyDate, penaltyAmount, penaltyDueDate, paymentReceived, compliance, closed } = req.body

  const production = process.env.NODE_ENV === 'production'

  const email = req.user?.email

  const inspectorEmail = await inspectorLookup(req.params.uuid, IllicitDischarge, inspectorId)

  const illicit = await IllicitDischarge.update({
    date,
    xCoordinate,
    yCoordinate,
    locationDescription,
    inspectorId,
    details,
    responsibleParty,
    volumeLost,
    streamWatershed: otherStreamWatershed ? otherStreamWatershed : streamWatershed,
    enforcementAction,
    penaltyDate: penaltyDate,
    penaltyAmount,
    penaltyDueDate: penaltyDueDate,
    paymentReceived: paymentReceived,
    compliance,
    closed,
    updatedBy: email,
  },
  {
    where: {
      uuid: req.params.uuid
    },
    returning: true,
  })

  const [affectedCount, affectedRows] = illicit

  if(affectedCount === 0) {
    return next(new ErrorResponse(`Unable to update illicit discharge by uuid ${ req.params.uuid }`, 500))
  }

  const data = (affectedRows as (Model<IllicitDischargeInterface> & IllicitDischargeInterface)[])[0]

  if(inspectorEmail && inspectorId && production) {
    await emailInspector(inspectorEmail.email, { uuid: data.uuid, illicitId: data.illicitId, details: data.details })
  }

  res.status(200).json({
    success: true,
    msg: "Violation Updated",
    data
  })
})

// @desc    Delete illicit discharge
// @route   DELETE /api/v1/stormwater/illicit-discharges/:uuid
// @access  Private
export const deleteIllicitDischarge = asyncHandler(async (req: Request<{ uuid: string }>, res: Response<ControllerResponse>, next: NextFunction) => {
  const result = await IllicitDischarge.destroy({
    where: {
      uuid: req.params.uuid
    }
  })

  if(result === 0) {
    return next(new ErrorResponse(`Unable to delete illicit discharge by uuid ${ req.params.uuid }`, 500))
  }

  res.status(200).json({
    success: true,
    msg: "Violation Deleted"
  })
})
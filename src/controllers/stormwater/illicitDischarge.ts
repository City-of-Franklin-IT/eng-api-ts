import { v4 as uuidv4 } from 'uuid'
import asyncHandler from '@middleware/async'
import { ErrorResponse } from '@utils/errorResponse'
import { IllicitDischarge, Inspector, FollowUpDate, Site, SiteContact, Contact } from '@models/stormwater'
import { emailInspector, inspectorLookup } from '@utils/automatedEmails/emailInspector'
import editorTracking from '@utils/editorTracking'

// Types
import { Request, Response, NextFunction } from 'express'
import { Model } from 'sequelize'
import { ControllerResponse } from '@controllers/types'
import * as Types from '@models/stormwater/types'

// @desc    Create illicit discharge
// @route   POST /api/v2/stormwater/illicit-discharges/create
// @access  Private
export const createIllicitDischarge = asyncHandler(async (req: Request<{}, {}, Types.IllicitDischargeCreationAttributes>, res: Response<ControllerResponse & { data: Types.IllicitDischargeInterface }>, next: NextFunction) => {
  const { complaintId, siteId, date, xCoordinate, yCoordinate, locationDescription, inspectorId, details, responsibleParty, volumeLost, streamWatershed, enforcementAction, penaltyDate, penaltyAmount, penaltyDueDate, paymentReceived } = req.body

  const production = process.env.NODE_ENV === 'production'

  const illicit = await IllicitDischarge.create({
    illicitId: `illicit-${ uuidv4() }`,
    complaintId,
    siteId,
    date,
    xCoordinate,
    yCoordinate,
    locationDescription,
    inspectorId,
    details,
    responsibleParty,
    volumeLost,
    streamWatershed,
    enforcementAction,
    penaltyDate,
    penaltyAmount,
    penaltyDueDate,
    paymentReceived,
    ...editorTracking(req)
  }) as unknown as Model<Types.IllicitDischargeInterface> & Types.IllicitDischargeInterface
    
  if(!illicit) {
    return next(new ErrorResponse("Unable to create illicit discharge", 500))
  }

  if(inspectorId && production) { // If inspector assigned - email inspector
    const inspector = await Inspector.findOne({
      where: {
        inspectorId
      },
      attributes: ['email']
    }) as Model<Types.InspectorInterface> & Types.InspectorInterface

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

// @desc    Get illicit discharges
// @route   GET /api/v2/stormwater/illicitdischarges
// @access  Private
export const getIllicitDischarges = asyncHandler(async (req: Request, res: Response<ControllerResponse & { data: Types.IllicitDischargeInterface[] }>, next: NextFunction) => {
  const illicitDischarges = await IllicitDischarge.findAll({
    order: [['date', 'desc'], [FollowUpDate, 'followUpDate', 'desc']],
    include: [
      { model: Inspector },
      { model: FollowUpDate },
      { model: Site,
        include: [
          { model: SiteContact,
            include: [
              { model: Contact }
            ]
          }
        ]
      } 
    ]
  }) as (Model<Types.IllicitDischargeInterface> & Types.IllicitDischargeInterface)[]

  res.status(200).json({
    success: true,
    data: illicitDischarges
  })
})

// @desc    Get illicit discharge
// @route   GET /api/v2/stormwater/illicit-discharges/:uuid
// @access  Private
export const getIllicitDischarge = asyncHandler(async (req: Request<{ uuid: string }>, res: Response<ControllerResponse & { data: Types.IllicitDischargeInterface }>, next: NextFunction) => {
  const illicit = await IllicitDischarge.findOne({
    where: {
      uuid: req.params.uuid
    },
    order: [[FollowUpDate, 'followUpDate', 'desc']],
    include: [
      { model: Inspector },
      { model: FollowUpDate },
    ]
  }) as Model<Types.IllicitDischargeInterface> & Types.IllicitDischargeInterface

  if(!illicit) {
    return next(new ErrorResponse(`Unable to return illicit discharge by uuid ${ req.params.uuid }`, 500))
  }

  res.status(200).json({
    success: true,
    data: illicit
  })
})

// @desc    Update illicit discharge
// @route   PUT /api/v2/stormwater/illicit-discharges/:uuid
// @access  Private
export const updateIllicitDischarge = asyncHandler(async (req: Request<{ uuid: string },{}, Types.IllicitDischargeCreationAttributes>, res: Response<ControllerResponse & { data: Types.IllicitDischargeInterface }>, next: NextFunction) => {
  const { date, xCoordinate, yCoordinate, locationDescription, inspectorId, details, responsibleParty, volumeLost, streamWatershed, enforcementAction, penaltyDate, penaltyAmount, penaltyDueDate, paymentReceived, compliance, closed } = req.body

  const production = process.env.NODE_ENV === 'production'

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
    streamWatershed,
    enforcementAction,
    penaltyDate,
    penaltyAmount,
    penaltyDueDate,
    paymentReceived,
    compliance,
    closed,
    ...editorTracking(req)
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

  const data = (affectedRows as (Model<Types.IllicitDischargeInterface> & Types.IllicitDischargeInterface)[])[0]

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
// @route   DELETE /api/v2/stormwater/illicit-discharges/:uuid
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
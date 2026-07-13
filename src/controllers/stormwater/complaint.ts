import { v4 as uuidv4 } from 'uuid'
import asyncHandler from '@middleware/async'
import { ErrorResponse } from '@utils/errorResponse'
import editorTracking from '@utils/editorTracking'
import { Complaint, Inspector, FollowUpDate, Site, SiteContact, Contact } from '@models/stormwater'
import { emailInspector, inspectorLookup } from '@utils/automatedEmails/emailInspector'

// Types
import { Request, Response, NextFunction } from 'express'
import { Model } from 'sequelize'
import { ControllerResponse } from '@controllers/types'
import * as Types from '@models/stormwater/types'

const excludeEditorFields = ['createdBy', 'updatedBy', 'createdAt', 'updatedAt']

// @desc    Create complaint
// @route   POST /api/v2/stormwater/complaint
// @access  Private
export const createComplaint = asyncHandler(async (req: Request<{}, {}, Types.ComplaintCreationAttributes>, res: Response<ControllerResponse & { data: Types.ComplaintInterface }>, next: NextFunction) => {
  const { date, siteId, inspectorId, name, address, phone, email, xCoordinate, yCoordinate, locationDescription, concern, otherConcern, details, responsibleParty, comments } = req.body

  const production = process.env.NODE_ENV === 'production'

  const complaint = await Complaint.create({
    complaintId: `complaint-${ uuidv4() }`,
    date, 
    siteId, 
    inspectorId, 
    name, 
    address, 
    phone, 
    email, 
    xCoordinate, 
    yCoordinate, 
    locationDescription, 
    concern, 
    otherConcern, 
    details, 
    responsibleParty,
    comments,
    ...editorTracking(req)
  }) as Model<Types.ComplaintInterface> & Types.ComplaintInterface

  if(inspectorId && production) { // If inspector assigned - email inspector
    const inspector = await Inspector.findOne({
      where: {
        inspectorId
      }
    }) as Model<Types.InspectorInterface> & Types.InspectorInterface

    if(inspector) {
      const data = { complaintId: complaint.complaintId, details: complaint.details, uuid: complaint.uuid }
      await emailInspector(inspector.email, data)
    }
  }

  res.status(201).json({
    success: true,
    msg: "Complaint Created",
    data: complaint
  })
})

// @desc    Get complaints
// @route   GET /api/v2/stormwater/complaint
// @access  Private
export const getComplaints = asyncHandler(async (req: Request, res: Response<ControllerResponse & { data: Types.ComplaintInterface[] }>, next: NextFunction) => {
  const complaints = await Complaint.findAll({
    order: [['date', 'desc'], [FollowUpDate, 'followUpDate', 'desc']],
    include: [
      { model: Inspector, attributes: { exclude: excludeEditorFields } },
      { model: FollowUpDate, attributes: { exclude: excludeEditorFields } },
      { model: Site, attributes: { exclude: excludeEditorFields },
        include: [
          { model: SiteContact, attributes: { exclude: excludeEditorFields },
            include: [
              { model: Contact, attributes: { exclude: excludeEditorFields } }
            ]
          }
        ]
      }
    ]
  }) as (Model<Types.ComplaintInterface> & Types.ComplaintInterface)[]

  res.status(200).json({
    success: true,
    data: complaints
  })
})

// @desc    Get complaint
// @route   GET /api/v2/stormwater/complaint/:uuid
// @access  Private
export const getComplaint = asyncHandler(async (req: Request<{ uuid: string }>, res: Response<ControllerResponse & { data: Types.ComplaintInterface }>, next: NextFunction) => {
  const complaint = await Complaint.findOne({
    where: {
      uuid: req.params.uuid
    },
    order: [[FollowUpDate, 'followUpDate', 'desc']],
    include: [
      { model: Inspector, attributes: { exclude: excludeEditorFields } },
      { model: Site, attributes: { exclude: excludeEditorFields } },
      { model: FollowUpDate, attributes: { exclude: excludeEditorFields } }
    ]
  }) as Model<Types.ComplaintInterface> & Types.ComplaintInterface

  if(!complaint) {
    return next(new ErrorResponse(`Unable to return complaint by uuid ${ req.params.uuid }`, 404))
  }

  res.status(200).json({
    success: true,
    data: complaint
  })
})

// @desc    Update complaint
// @route   PUT /api/v2/stormwater/complaint/:uuid
// @access  Private
export const updateComplaint = asyncHandler(async (req: Request<{ uuid: string }, {}, Types.ComplaintCreationAttributes>, res: Response<ControllerResponse & { data: Types.ComplaintInterface }>, next: NextFunction) => {
  const { date, siteId, inspectorId, name, address, phone, email, xCoordinate, yCoordinate, locationDescription, concern, otherConcern, details, responsibleParty, comments, compliance, closed } = req.body

  const production = process.env.NODE_ENV === 'production'

  const inspectorEmail = await inspectorLookup(req.params.uuid, Complaint, inspectorId)

  const complaint = await Complaint.update({
    date, 
    siteId, 
    inspectorId, 
    name, 
    address, 
    phone, 
    email, 
    xCoordinate, 
    yCoordinate, 
    locationDescription, 
    concern, 
    otherConcern, 
    details, 
    responsibleParty, 
    comments, 
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

  const [affectedCount, affectedRows] = complaint

  if(affectedCount === 0) {
    return next(new ErrorResponse(`Unable to update complaint by uuid ${ req.params.uuid }`, 404))
  }

  const data = (affectedRows as (Model<Types.ComplaintInterface> & Types.ComplaintInterface)[])[0]

  if(inspectorEmail && inspectorId && production) { // If inspector assigned - email inspector
    const obj = { siteId: data.siteId, complaintId: data.complaintId, details: data.details, uuid: data.uuid }
    await emailInspector(inspectorEmail.email, obj)
  }

  res.status(200).json({
    success: true,
    msg: "Complaint Updated",
    data
  })
})

// @desc    Delete complaint
// @route   DELETE /api/v2/stormwater/complaint/:uuid
// @access  Private
export const deleteComplaint = asyncHandler(async (req: Request<{ uuid: string }>, res: Response<ControllerResponse>, next: NextFunction) => {
  const result = await Complaint.destroy({
    where: {
      uuid: req.params.uuid
    }
  })

  if(result === 0) {
    return next(new ErrorResponse(`Unable to delete complaint by uuid ${ req.params.uuid }`, 404))
  }

  res.status(200).json({
    success: true,
    msg: "Complaint Deleted"
  })
})
import { v4 as uuidv4 } from 'uuid'
import asyncHandler from '@middleware/async'
import { ErrorResponse } from '@utils/errorResponse'
import { Complaint, Inspector, FollowUpDate, Site } from '@models/stormwater'
import { emailInspector, inspectorLookup } from '@utils/automatedEmails/emailInspector'

// Types
import { Request, Response, NextFunction } from 'express'
import { Model } from 'sequelize'
import { ControllerResponse } from '@controllers/types'
import { ComplaintInterface, InspectorInterface } from '@models/stormwater/types'
import { CreateComplaintRequest, CreateComplaintResponse, GetComplaintsResponse, GetComplaintResponse, UpdateComplaintRequest, UpdateComplaintResponse } from './types'

// @desc    Create complaint
// @route   POST /api/v1/stormwater/complaints
// @access  Private
export const createComplaint = asyncHandler(async (req: Request<{}, {}, CreateComplaintRequest>, res: Response<CreateComplaintResponse>, next: NextFunction) => {
  const { date, siteId, inspectorId, name, address, phone, email, xCoordinate, yCoordinate, locationDescription, concern, otherConcern, details, responsibleParty, comments } = req.body

  const production = process.env.NODE_ENV === 'production'

  const userEmail = req.user?.email

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
    createdBy: userEmail,
    updatedBy: userEmail,
  }) as Model<ComplaintInterface> & ComplaintInterface

  if(!complaint) {
    return next(new ErrorResponse("Unable to create complaint", 500))
  }

  if(inspectorId && production) { // If inspector assigned - email inspector
    const inspector = await Inspector.findOne({
      where: {
        inspectorId
      }
    }) as Model<InspectorInterface> & InspectorInterface

    const data = { complaintId: complaint.complaintId, details: complaint.details, uuid: complaint.uuid }
    await emailInspector(inspector.email, data)
  }

  res.status(201).json({
    success: true,
    msg: "Complaint Created",
    data: complaint
  })
})

// @desc    Get complaints - no associated site
// @route   GET /api/v1/stormwater/complaints
// @access  Private
export const getComplaints = asyncHandler(async (req: Request, res: Response<GetComplaintsResponse>, next: NextFunction) => {
  const complaints = await Complaint.findAll({
    where: {
      siteId: null
    },
    order: [['date', 'desc'], [FollowUpDate, 'followUpDate', 'desc']],
    include: [ { model: FollowUpDate } ]
  }) as Model<ComplaintInterface>[] & ComplaintInterface

  res.status(200).json({
    success: true,
    data: complaints
  })
})

// @desc    Get complaint
// @route   GET /api/v1/stormwater/complaints/:uuid
// @access  Private
export const getComplaint = asyncHandler(async (req: Request<{ uuid: string }>, res: Response<GetComplaintResponse>, next: NextFunction) => {
  const complaint = await Complaint.findOne({
    where: {
      uuid: req.params.uuid
    },
    order: [[FollowUpDate, 'followUpDate', 'desc']],
    include: [
      { model: Site },
      { model: FollowUpDate}
    ]
  }) as Model<ComplaintInterface> & ComplaintInterface

  if(!complaint) {
    return next(new ErrorResponse(`Unable to return complaint by uuid ${ req.params.uuid }`, 500))
  }

  res.status(200).json({
    success: true,
    data: complaint
  })
})

// @desc    Update complaint
// @route   PUT /api/v1/stormwater/complaints/:uuid
// @access  Private
export const updateComplaint = asyncHandler(async (req: Request<{ uuid: string }, {}, UpdateComplaintRequest>, res: Response<UpdateComplaintResponse>, next: NextFunction) => {
  const { date, siteId, inspectorId, name, address, phone, email, xCoordinate, yCoordinate, locationDescription, concern, otherConcern, details, responsibleParty, comments, compliance, closed } = req.body

  const production = process.env.NODE_ENV === 'production'

  const userEmail = req.user?.email

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
    updatedBy: userEmail,
  },
  {
    where: {
      uuid: req.params.uuid
    },
    returning: true
  })

  const [affectedCount, affectedRows] = complaint

  if(affectedCount === 0) {
    return next(new ErrorResponse(`Unable to update complaint by uuid ${ req.params.uuid }`, 500))
  }

  const data = (affectedRows as (Model<ComplaintInterface> & ComplaintInterface)[])[0]

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
// @route   DELETE /api/v1/stormwater/complaints/:uuid
// @access  Private
export const deleteComplaint = asyncHandler(async (req: Request<{ uuid: string }>, res: Response<ControllerResponse>, next: NextFunction) => {
  const result = await Complaint.destroy({
    where: {
      uuid: req.params.uuid
    }
  })

  if(result === 0) {
    return next(new ErrorResponse(`Unable to delete complaint by uuid ${ req.params.uuid }`, 500))
  }

  res.status(200).json({
    success: true,
    msg: "Complaint Deleted"
  })
})
import asyncHandler from '@middleware/async'
import { ErrorResponse } from '@utils/errorResponse'
import { Inspector, Site, Complaint, SiteContact, Contact, Log, ConstructionViolation, FollowUpDate, IllicitDischarge } from '@models/stormwater'

// Types
import { Request, Response, NextFunction } from 'express'
import { Model } from 'sequelize'
import { ControllerResponse } from '@controllers/types'
import { InspectorInterface, SiteInterface } from '@models/stormwater/types'
import { CreateInspectorRequest, CreateInspectorResponse, GetInspectorsResponse, GetInspectorResponse, UpdateInspectorRequest, UpdateInspectorResponse } from './types'

// @desc    Create inspector
// @route   POST /api/v1/stormwater/inspectors
// @access  Private
export const createInspector = asyncHandler(async (req: Request<{}, {}, CreateInspectorRequest>, res: Response<CreateInspectorResponse>, next: NextFunction) => {
  const { name, email } = req.body

  const userEmail = req.user?.email

  const { nanoid } = await import('nanoid')

  const inspector = await Inspector.create({
    inspectorId: `inspector-${ nanoid() }`,
    name,
    email,
    slug: name.split(' ')[0].toLowerCase() + '-' + name.split(' ')[1].toLowerCase(),
    createdBy: userEmail,
    updatedBy: userEmail,
  }) as Model<InspectorInterface> & InspectorInterface

  if(!inspector) {
    return next(new ErrorResponse("Unable to create inspector", 500))
  }

  res.status(201).json({
    success: true,
    msg: "Inspector Created",
    data: inspector
  })
})

// @desc    Get inspectors
// @route   GET /api/v1/stormwater/inspectors
// @access  Private
export const getInspectors = asyncHandler(async (req: Request, res: Response<GetInspectorsResponse>, next: NextFunction) => {
  const inspectors = await Inspector.findAll({
    order: [['name', 'asc'], [Site, 'name', 'asc'], [Complaint, 'date', 'desc']],
    include: [
      { model: Site },
      { model: Complaint }]
  }) as Model<InspectorInterface>[] & InspectorInterface

  res.status(200).json({
    success: true,
    data: inspectors
  })
})

// @desc    Get inspector sites by inspectorId
// @route   GET /api/v1/stormwater/inspectors/:inspectorId
// @access  Private
export const getInspector = asyncHandler(async (req: Request<{ inspectorId: string }>, res: Response<GetInspectorResponse>, next: NextFunction) => {
  const results = await Site.findAll({
    where: {
      inspectorId: req.params.inspectorId
    },
    order: [['name', 'asc']],
    include: [
      { model: Inspector },
      { model: SiteContact,
        include: [{ model: Contact }]
      },
      { model: Log },
      { model: ConstructionViolation,
        include: [{ model: FollowUpDate }]
      },
      { model: Complaint,
        include: 
          [{ model: FollowUpDate }]
      },{
        model: IllicitDischarge,
        include: [{ model: FollowUpDate }]
      }
    ]
  }) as Model<SiteInterface>[] & SiteInterface

  const sites = results.map(result => {
    const site = result.toJSON()

    const openViolations = !!site.ConstructionViolations?.some(violation => !violation.closed)
    const openComplaints = !!site.Complaints?.some(complaint => !complaint.closed)
    const openIllicitDischarges = !!site.IllicitDischarges?.some(discharge => !discharge.closed)

    return {
      ...site,
      hasOpenViolation: openViolations,
      hasOpenComplaint: openComplaints,
      hasOpenIllicitDischarge: openIllicitDischarges
    } as Model<SiteInterface> & SiteInterface
  })

  const inspector = await Inspector.findOne({
    where: {
      inspectorId: req.params.inspectorId
    }
  }) as Model<InspectorInterface> & InspectorInterface

  res.status(200).json({
    success: true,
    data: { sites, inspector }
  })
})

// @desc    Update inspector
// @route   PUT /api/v1/stormwater/inspectors/:slug
// @access  Private
export const updateInspector = asyncHandler(async (req: Request<{ slug: string }, {}, UpdateInspectorRequest>, res: Response<UpdateInspectorResponse>, next: NextFunction) => {
  const { name, email, inactive } = req.body

  const userEmail = req.user?.email

  const inspector = await Inspector.update({
    name,
    email,
    inactive,
    updatedBy: userEmail
  },
  {
    where: {
      slug: req.params.slug
    },
    returning: true
  })

  const [affectedCount, affectedRows] = inspector

  if(affectedCount === 0) {
    return next(new ErrorResponse(`Unable to update inspector by slug ${ req.params.slug }`, 500))
  }

  const data = (affectedRows as (Model<InspectorInterface> & InspectorInterface)[])[0]

  res.status(200).json({
    success: true,
    msg: "Inspector Updated",
    data
  })
})

// @desc    Delete inspector
// @route   DELETE /api/v1/stormwater/inspectors/:slug
// @access  Private
export const deleteInspector = asyncHandler(async (req:  Request<{ slug: string }>, res: Response<ControllerResponse>, next: NextFunction) => {
  const result = await Inspector.destroy({
    where: {
      slug: req.params.slug
    }
  })

  if(result === 0) {
    return next(new ErrorResponse(`Unable to delete inspector by slug ${ req.params.slug }`, 500))
  }

  res.status(200).json({
    success: true,
    msg: "Inspector Deleted"
  })
})

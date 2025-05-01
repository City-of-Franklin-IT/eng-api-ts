import { v4 as uuidv4 } from 'uuid'
import asyncHandler from '@middleware/async'
import { ErrorResponse } from '@utils/errorResponse'
import editorTracking from '@utils/editorTracking'
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

  const inspector = await Inspector.create({
    inspectorId: `inspector-${ uuidv4() }`,
    name,
    email,
    slug: name.split(' ')[0].toLowerCase() + '-' + name.split(' ')[1].toLowerCase(),
    ...editorTracking(req)
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

// @desc    Get inspector sites
// @route   GET /api/v1/stormwater/inspectors/:inspectorid
// @access  Private
export const getInspector = asyncHandler(async (req: Request<{ inspectorid: string }>, res: Response<GetInspectorResponse>, next: NextFunction) => {
  const results = await Site.findAll({
    where: {
      inspectorId: req.params.inspectorid
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
      inspectorId: req.params.inspectorid
    }
  }) as Model<InspectorInterface> & InspectorInterface

  res.status(200).json({
    success: true,
    data: { sites, inspector }
  })
})

// @desc    Update inspector
// @route   PUT /api/v1/stormwater/inspectors/:inspectorid
// @access  Private
export const updateInspector = asyncHandler(async (req: Request<{ inspectorid: string }, {}, UpdateInspectorRequest>, res: Response<UpdateInspectorResponse>, next: NextFunction) => {
  const { name, email, inactive } = req.body

  const inspector = await Inspector.update({
    name,
    email,
    inactive,
    ...editorTracking(req)
  },
  {
    where: {
      inspectorId: req.params.inspectorid
    },
    returning: true
  })

  const [affectedCount, affectedRows] = inspector

  if(affectedCount === 0) {
    return next(new ErrorResponse(`Unable to update inspector by inspectorId ${ req.params.inspectorid }`, 500))
  }

  const data = (affectedRows as (Model<InspectorInterface> & InspectorInterface)[])[0]

  res.status(200).json({
    success: true,
    msg: "Inspector Updated",
    data
  })
})

// @desc    Delete inspector
// @route   DELETE /api/v1/stormwater/inspectors/:inspectorid
// @access  Private
export const deleteInspector = asyncHandler(async (req:  Request<{ inspectorid: string }>, res: Response<ControllerResponse>, next: NextFunction) => {
  const result = await Inspector.destroy({
    where: {
      inspectorId: req.params.inspectorid
    }
  })

  if(result === 0) {
    return next(new ErrorResponse(`Unable to delete inspector by inspectorId ${ req.params.inspectorid }`, 500))
  }

  res.status(200).json({
    success: true,
    msg: "Inspector Deleted"
  })
})

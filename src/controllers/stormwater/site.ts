import { v4 as uuidv4 } from 'uuid'
import { Op } from 'sequelize'
import asyncHandler from '@middleware/async'
import { ErrorResponse } from '@utils/errorResponse'
import editorTracking from '@utils/editorTracking'
import { Inspector, Site, Complaint, SiteContact, Contact, Log, ConstructionViolation, FollowUpDate, IllicitDischarge } from '@models/stormwater'
import { emailInspector, inspectorLookup } from '@utils/automatedEmails/emailInspector'

// Types
import { Request, Response, NextFunction } from 'express'
import { Model } from 'sequelize'
import { ControllerResponse } from '@controllers/types'
import { InspectorInterface, SiteInterface } from '@models/stormwater/types'
import { CreateSiteRequest, CreateSiteResponse, GetSitesResponse, GetSiteResponse, UpdateSiteRequest, UpdateSiteResponse, GetActiveSitesResponse } from './types'

// @desc    Create site
// @route   POST /api/v1/stormwater/sites
// @access  Private
export const createSite = asyncHandler(async (req: Request<{}, {}, CreateSiteRequest>, res: Response<CreateSiteResponse>, next: NextFunction) => {
  const { inspectorId, name, preconDate, location, xCoordinate, yCoordinate, permit, cof, tnq, greenInfrastructure } = req.body

  const production = process.env.NODE_ENV === 'production'

  const site = await Site.create({
    siteId: `site-${ uuidv4() }`,
    inspectorId,
    name,
    preconDate,
    location,
    xCoordinate,
    yCoordinate,
    permit,
    cof,
    tnq,
    greenInfrastructure,
    ...editorTracking(req)
  }) as Model<SiteInterface> & SiteInterface

  if(!site) {
    return next(new ErrorResponse("Unable to create site", 500))
  }

  // if(inspectorId && production) { // If inspector assigned and in production - email inspector
  //   const inspector = await Inspector.findOne({
  //     where: {
  //       inspectorId
  //     },
  //     attributes: ['email']
  //   }) as Model<InspectorInterface> & InspectorInterface

  //   if(inspector) {
  //     await emailInspector(inspector.email, { uuid: site.uuid, name: site.name })
  //   }
  // }

  res.status(201).json({
    success: true,
    msg: "Site Created",
    data: site
  })
})

// @desc    Get sites
// @route   GET /api/v1/stormwater/sites
// @access  Private
export const getSites = asyncHandler(async (req: Request, res: Response<GetSitesResponse>, next: NextFunction) => {
  const results = await Site.findAll({
    order: [
      ['name', 'asc'], 
      [Log, 'inspectionDate', 'desc'], 
      [ConstructionViolation, 'date', 'desc'], 
      [ConstructionViolation, FollowUpDate, 'followUpDate', 'desc'],
      [Complaint, 'date', 'desc'],  
      [Complaint, FollowUpDate, 'followUpDate', 'desc'],
      [IllicitDischarge, 'date', 'desc'],
      [IllicitDischarge, FollowUpDate, 'followUpDate', 'desc']
    ],
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

  res.status(200).json({
    success: true,
    data: sites
  })
})

// @desc    Get site
// @route   GET /api/v1/stormwater/sites/:uuid
// @access  Private
export const getSite = asyncHandler(async (req: Request<{ uuid: string }>, res: Response<GetSiteResponse>, next: NextFunction) => {
  const site = await Site.findOne({
    where: {
      uuid: req.params.uuid
    },
    order: [
      ['name', 'asc'], 
      [Log, 'inspectionDate', 'desc'], 
      [ConstructionViolation, 'date', 'desc'], 
      [ConstructionViolation, FollowUpDate, 'followUpDate', 'desc'],
      [Complaint, 'date', 'desc'],  
      [Complaint, FollowUpDate, 'followUpDate', 'desc'],
      [IllicitDischarge, 'date', 'desc'],
      [IllicitDischarge, FollowUpDate, 'followUpDate', 'desc']
    ],
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
  }) as Model<SiteInterface> & SiteInterface

  if(!site) {
    return next(new ErrorResponse(`Unable to return site by uuid ${ req.params.uuid }`, 500))
  }

  site.hasOpenViolation = !!site.ConstructionViolations?.some(violation => !violation.closed)
  site.hasOpenComplaint = !!site.Complaints?.some(complaint => !complaint.closed)
  site.hasOpenIllicitDischarge = !!site.IllicitDischarges?.some(discharge => !discharge.closed)

  res.status(200).json({
    success: true,
    data: site
  })
})

// @desc    Update site
// @route   PUT /api/v1/stormwater/sites/:uuid
// @access  Private
export const updateSite = asyncHandler(async (req: Request<{ uuid: string }, {}, UpdateSiteRequest>, res: Response<UpdateSiteResponse>, next: NextFunction) => {
  const { inspectorId, name, location, preconDate, xCoordinate, yCoordinate, permit, cof, tnq, greenInfrastructure, inactive } = req.body

  const production = process.env.NODE_ENV === 'production'

  const inspector = await inspectorLookup(req.params.uuid, Site, inspectorId)

  const site = await Site.update({
    inspectorId,
    name,
    location,
    preconDate,
    xCoordinate,
    yCoordinate,
    permit,
    cof,
    tnq,
    greenInfrastructure,
    inactive,
    ...editorTracking(req)
  },{
    where: {
      uuid: req.params.uuid
    },
    returning: true
  })

  const [affectedRows, updatedRecords] = site

  if(affectedRows === 0) {
    return next(new ErrorResponse(`Unable to update site by uuid ${ req.params.uuid }`, 500))
  }

  const data = (updatedRecords as (Model<SiteInterface> & SiteInterface)[])[0]

  if(inspector && inspectorId && production) { // If inspector assigned and in production - email inspector
    await emailInspector(inspector.email, { uuid: data.uuid, name: data.name })
  }

  res.status(200).json({
    success: true,
    msg: "Site Updated",
    data
  })
})

// @desc    Delete site
// @route   DELETE /api/v1/stormwater/sites/:uuid
// @access  Private
export const deleteSite = asyncHandler(async (req: Request<{ uuid: string }>, res: Response<ControllerResponse>, next: NextFunction) => {
  const result = await Site.destroy({
    where: {
      uuid: req.params.uuid
    }
  })

  if(result === 0) {
    return next(new ErrorResponse(`Unable to delete site by uuid ${ req.params.uuid }`, 500)) 
  }

  res.status(200).json({
    success: true,
    msg: "Site Deleted"
  })
})

//@desc    Get active sites
//@route   GET /api/v1/stormwater/sites/active
//@access  Private
export const getActiveSites = asyncHandler(async (req: Request, res: Response<GetActiveSitesResponse>, next: NextFunction) => {
  const sites = await Site.findAll({
    where: {
      inactive: {
        [Op.ne]: true
      }
    },
    order: [['name', 'asc']],
    attributes: ['name', 'siteId', 'xCoordinate', 'yCoordinate', 'inspectorId', 'uuid']
  }) as Model<SiteInterface>[] & SiteInterface

  res.status(200).json({
    success: true,
    data: sites
  })
})
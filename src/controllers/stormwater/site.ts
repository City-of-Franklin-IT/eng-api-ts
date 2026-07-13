import { v4 as uuidv4 } from 'uuid'
import { Op } from 'sequelize'
import asyncHandler from '@middleware/async'
import { ErrorResponse } from '@utils/errorResponse'
import editorTracking from '@utils/editorTracking'
import { Inspector, Site, Complaint, SiteContact, Contact, Log, ConstructionViolation, FollowUpDate, IllicitDischarge, InactiveSite, IncompleteSite } from '@models/stormwater'
import { emailInspector, inspectorLookup } from '@utils/automatedEmails/emailInspector'

// Types
import { Request, Response, NextFunction } from 'express'
import { Model } from 'sequelize'
import { ControllerResponse } from '@controllers/types'
import * as Types from '@models/stormwater/types'

const excludeEditorFields = ['createdBy', 'updatedBy', 'createdAt', 'updatedAt']
const excludeEditorFieldsKeepCreatedAt = ['createdBy', 'updatedBy', 'updatedAt']

// @desc    Create site
// @route   POST /api/v2/stormwater/site
// @access  Private
export const createSite = asyncHandler(async (req: Request<{}, {}, Types.SiteCreationAttributes>, res: Response<ControllerResponse & { data: Types.SiteInterface }>, next: NextFunction) => {
  const { inspectorId, name, preconDate, location, xCoordinate, yCoordinate, permit, cof, tnq, greenInfrastructure } = req.body

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
  }) as Model<Types.SiteInterface> & Types.SiteInterface

  res.status(201).json({
    success: true,
    msg: "Site Created",
    data: site
  })
})

// @desc    Get sites
// @route   GET /api/v2/stormwater/site
// @access  Private
export const getSites = asyncHandler(async (req: Request, res: Response<ControllerResponse & { data: Types.SiteInterface[] }>, next: NextFunction) => {
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
      { model: Log, attributes: { exclude: excludeEditorFields } },
      { model: ConstructionViolation, attributes: { exclude: excludeEditorFields }, include: [{ model: FollowUpDate, attributes: { exclude: excludeEditorFields } }] },
      { model: Complaint, attributes: { exclude: excludeEditorFields }, include: [{ model: FollowUpDate, attributes: { exclude: excludeEditorFields } }] },
      { model: IllicitDischarge, attributes: { exclude: excludeEditorFields }, include: [{ model: FollowUpDate, attributes: { exclude: excludeEditorFields } }] },
      { model: InactiveSite, attributes: { exclude: excludeEditorFieldsKeepCreatedAt } },
      { model: IncompleteSite, attributes: { exclude: excludeEditorFieldsKeepCreatedAt } }
    ]
  }) as Model<Types.SiteInterface>[] & Types.SiteInterface

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
    } as Model<Types.SiteInterface> & Types.SiteInterface
  })

  res.status(200).json({
    success: true,
    data: sites
  })
})

// @desc    Get site
// @route   GET /api/v2/stormwater/sites/:uuid
// @access  Private
export const getSite = asyncHandler(async (req: Request<{ uuid: string }>, res: Response<ControllerResponse & { data: Types.SiteInterface }>, next: NextFunction) => {
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
      { model: Inspector, attributes: { exclude: excludeEditorFields } },
      { model: SiteContact, attributes: { exclude: excludeEditorFields },
        include: [{ model: Contact, attributes: { exclude: excludeEditorFields } }]
      },
      { model: Log, attributes: { exclude: excludeEditorFields } },
      { model: ConstructionViolation, attributes: { exclude: excludeEditorFields },
        include: [{ model: FollowUpDate, attributes: { exclude: excludeEditorFields } }]
      },
      { model: Complaint, attributes: { exclude: excludeEditorFields },
        include: [{ model: FollowUpDate, attributes: { exclude: excludeEditorFields } }]
      },{
        model: IllicitDischarge, attributes: { exclude: excludeEditorFields },
        include: [{ model: FollowUpDate, attributes: { exclude: excludeEditorFields } }]
      },
      { model: InactiveSite, attributes: { exclude: excludeEditorFieldsKeepCreatedAt } },
      { model: IncompleteSite, attributes: { exclude: excludeEditorFieldsKeepCreatedAt } }
    ]
  }) as Model<Types.SiteInterface> & Types.SiteInterface

  if(!site) {
    return next(new ErrorResponse(`Unable to return site by uuid ${ req.params.uuid }`, 404))
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
// @route   PUT /api/v2/stormwater/sites/:uuid
// @access  Private
export const updateSite = asyncHandler(async (req: Request<{ uuid: string }, {}, Types.SiteCreationAttributes>, res: Response<ControllerResponse & { data: Types.SiteInterface }>, next: NextFunction) => {
  const { inspectorId, name, location, preconDate, xCoordinate, yCoordinate, permit, cof, tnq, greenInfrastructure } = req.body

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
    ...editorTracking(req)
  },{
    where: {
      uuid: req.params.uuid
    },
    returning: true
  })

  const [affectedRows, updatedRecords] = site

  if(affectedRows === 0) {
    return next(new ErrorResponse(`Unable to update site by uuid ${ req.params.uuid }`, 404))
  }

  const data = (updatedRecords as (Model<Types.SiteInterface> & Types.SiteInterface)[])[0]

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
// @route   DELETE /api/v2/stormwater/sites/:uuid
// @access  Private
export const deleteSite = asyncHandler(async (req: Request<{ uuid: string }>, res: Response<ControllerResponse>, next: NextFunction) => {
  const result = await Site.destroy({
    where: {
      uuid: req.params.uuid
    }
  })

  if(result === 0) {
    return next(new ErrorResponse(`Unable to delete site by uuid ${ req.params.uuid }`, 404))
  }

  res.status(200).json({
    success: true,
    msg: "Site Deleted"
  })
})

//@desc    Get active sites
//@route   GET /api/v2/stormwater/sites/active
//@access  Private
export const getActiveSites = asyncHandler(async (req: Request, res: Response<ControllerResponse & { data: Types.SiteInterface[] }>, next: NextFunction) => {
  const inactiveSites = await InactiveSite.findAll({
    attributes: ['siteId']
  }) as (Model<Types.InactiveSiteInterface> & Types.InactiveSiteInterface)[]

  const sites = await Site.findAll({
    where: {
      siteId: {
        [Op.notIn]: inactiveSites.flatMap(site => site.siteId)
      }
    },
    order: [['name', 'asc']],
    attributes: ['name', 'siteId', 'permit', 'cof', 'tnq', 'xCoordinate', 'yCoordinate', 'uuid']
  }) as (Model<Types.SiteInterface> & Types.SiteInterface)[]

  res.status(200).json({
    success: true,
    data: sites
  })
})

//@desc    Get active site
//@route   GET /api/v2/stormwater/sites/active/:uuid
//@access  Public
export const getActiveSite = asyncHandler(async (req: Request<{ uuid: string }>, res: Response<ControllerResponse & { data: Types.SiteInterface }>, next: NextFunction) => {
  const site = await Site.findOne({
    where: {
      uuid: req.params.uuid
    },
    attributes: ['name', 'siteId', 'permit', 'cof', 'tnq', 'xCoordinate', 'yCoordinate', 'uuid']
  }) as (Model<Types.SiteInterface> & Types.SiteInterface)

  if(!site) {
    return next(new ErrorResponse(`Could not return site by uuid ${ req.params.uuid }`, 404))
  }

  res.status(200).json({
    success: true,
    data: site
  })
})
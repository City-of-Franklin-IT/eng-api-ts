import asyncHandler from '@middleware/async'
import { ErrorResponse } from '@utils/errorResponse'
import editorTracking from '@utils/editorTracking'
import { SiteContact } from '@models/stormwater'

// Types
import { Request, Response, NextFunction } from 'express'
import { Model } from 'sequelize'
import { SiteContactInterface } from '@models/stormwater/types'
import { CreateSiteContactRequest, CreateSiteContactResponse } from './types'
import { ControllerResponse } from '@controllers/types'

// @desc    Create site contact
// @route   POST /api/v1/stormwater/site-contacts
// @access  Private
export const createSiteContact = asyncHandler(async (req: Request<{}, {}, CreateSiteContactRequest>, res: Response<CreateSiteContactResponse>, next: NextFunction) => {
  const { siteId, contactId, isPrimary, isContractor, isInspector } = req.body

  const siteContact = await SiteContact.create({
    siteId,
    contactId,
    isPrimary,
    isContractor,
    isInspector,
    ...editorTracking(req)
  }) as Model<SiteContactInterface> & SiteContactInterface

  if(!siteContact) {
    return next(new ErrorResponse("Unable to create site contact", 500))
  }

  res.status(201).json({
    success: true,
    msg: "Site Contact Created",
    data: siteContact
  })
})

// @desc    Delete all site contacts by siteId
// @route   DELETE /api/v1/eng/stormwater/site-contacts/site/:siteid
export const deleteSiteContacts = asyncHandler(async (req: Request<{ siteid: string }>, res: Response<ControllerResponse>, next: NextFunction) => {
  await SiteContact.destroy({
    where: {
      siteId: req.params.siteid
    }
  })

  res.status(200).json({
    success: true,
    msg: "Site Contacts Deleted"
  })
})
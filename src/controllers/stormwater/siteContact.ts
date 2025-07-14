import asyncHandler from '@middleware/async'
import { ErrorResponse } from '@utils/errorResponse'
import editorTracking from '@utils/editorTracking'
import { SiteContact } from '@models/stormwater'

// Types
import { Request, Response, NextFunction } from 'express'
import { Model } from 'sequelize'
import { ControllerResponse } from '@controllers/types'
import * as Types from '@models/stormwater/types'

// @desc    Create site contact
// @route   POST /api/v2/stormwater/site-contact
// @access  Private
export const createSiteContact = asyncHandler(async (req: Request<{}, {}, Types.SiteContactCreationAttributes>, res: Response<ControllerResponse & { data: Types.SiteContactInterface }>, next: NextFunction) => {
  const { siteId, contactId, isPrimary, isContractor, isInspector } = req.body

  const siteContact = await SiteContact.create({
    siteId,
    contactId,
    isPrimary,
    isContractor,
    isInspector,
    ...editorTracking(req)
  }) as Model<Types.SiteContactInterface> & Types.SiteContactInterface

  if(!siteContact) {
    return next(new ErrorResponse("Unable to create site contact", 500))
  }

  res.status(201).json({
    success: true,
    msg: "Site Contact Created",
    data: siteContact
  })
})

//@desc    Delete site contact by uuid
//@route   DELETE /api/v2/eng/stormwater/site-contact/:uuid
//@access  Private
export const deleteSiteContact = asyncHandler(async (req: Request<{ uuid: string }>, res: Response<ControllerResponse>, next: NextFunction) => {
  const result = await SiteContact.destroy({
    where: {
      uuid: req.params.uuid
    }
  })

  if(result === 0) {
    return next(new ErrorResponse(`Unable to delete site contact by uuid ${ req.params.uuid }`, 500))
  }

  res.status(200).json({
    success: true,
    msg: "Site Contact Deleted"
  })
})

//@desc    Delete all site contacts by siteId
//@route   DELETE /api/v2/eng/stormwater/site-contact/site/:siteid
//@access  Private
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
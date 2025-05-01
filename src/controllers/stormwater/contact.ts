import { v4 as uuidv4 } from 'uuid'
import asyncHandler from '@middleware/async'
import { ErrorResponse } from '@utils/errorResponse'
import editorTracking from '@utils/editorTracking'
import { Contact, SiteContact, Site } from '@models/stormwater'

// Types
import { Request, Response, NextFunction } from 'express'
import { Model } from 'sequelize'
import { ControllerResponse } from '@controllers/types'
import { ContactInterface } from '@models/stormwater/types'
import { CreateContactRequest, CreateContactResponse, GetContactsResponse, GetContactResponse, UpdateContactRequest, UpdateContactResponse } from './types'

// @desc    Create contact
// @route   POST /api/v1/stormwater/contacts
// @access  Private
export const createContact = asyncHandler(async (req: Request<{}, {}, CreateContactRequest>, res: Response<CreateContactResponse>, next: NextFunction) => {
  const { name, phone, company, email } = req.body

  const contact = await Contact.create({
    contactId: `contact-${ uuidv4() }`,
    name,
    phone,
    company,
    email,
    ...editorTracking(req)
  }) as Model<ContactInterface> & ContactInterface

  if(!contact) {
    return next(new ErrorResponse("Unable to create contact", 500))
  }

  res.status(201).json({
    success: true,
    msg: "Contact Created",
    data: contact
  })
})

// @desc    Get contacts
// @route   GET /api/v1/stormwater/contacts
// @access  Private
export const getContacts = asyncHandler(async (req: Request, res: Response<GetContactsResponse>, next: NextFunction) => {
  const contacts = await Contact.findAll({
    order: [['name', 'asc']],
    include: [
      { model: SiteContact, 
        include: [{ model: Site }] }]
  }) as Model<ContactInterface>[] & ContactInterface

  res.status(200).json({
    success: true,
    data: contacts
  })
})

// @desc    Get contact
// @route   GET /api/v1/stormwater/contacts/:uuid
// @access  Private
export const getContact = asyncHandler(async (req: Request<{ uuid: string }>, res: Response<GetContactResponse>, next: NextFunction) => {
  const contact = await Contact.findOne({
    where: {
      uuid: req.params.uuid
    },
    include: [{
      model: SiteContact,
      include: [{ model: Site }]
    }]
  }) as Model<ContactInterface> & ContactInterface

  if(!contact) {
    return next(new ErrorResponse(`Unable to return contact by uuid ${ req.params.uuid }`, 500))
  }

  res.status(200).json({
    success: true,
    data: contact
  })
})

// @desc    Update contact
// @route   PUT /api/v1/stormwater/contacts/:uuid
// @access  Private
export const updateContact = asyncHandler(async (req: Request<{ uuid: string }, {}, UpdateContactRequest>, res: Response<UpdateContactResponse>, next: NextFunction) => {
  const { name, phone, company, email, inactive } = req.body

  const contact = await Contact.update({
    name,
    phone,
    company,
    email,
    inactive,
    ...editorTracking(req)
  },{
    where: {
      uuid: req.params.uuid
    },
    returning: true,
  })

  const [affectedCount, affectedRows] = contact

  if(affectedCount === 0) {
    return next(new ErrorResponse(`Unable to update contact by uuid ${ req.params.uuid }`, 500))
  }

  const data = (affectedRows as (Model<ContactInterface> & ContactInterface)[])[0]

  res.status(200).json({
    success: true,
    msg: "Contact Updated",
    data
  })
})

// @desc    Delete contact
// @route   DELETE /api/v1/stormwater/contacts/:uuid
// @access  Private
export const deleteContact = asyncHandler(async (req: Request<{ uuid: string }>, res: Response<ControllerResponse>, next: NextFunction) => {
  const result = await Contact.destroy({
    where: {
      uuid: req.params.uuid
    }
  })

  if(result === 0) {
    return next(new ErrorResponse(`Unable to delete contact by uuid ${ req.params.uuid }`, 500))
  }

  res.status(200).json({
    success: true,
    msg: "Contact Deleted"
  })
})
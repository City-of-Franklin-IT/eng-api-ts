import { nanoid } from 'nanoid'
import asyncHandler from '@middleware/async'
import { ErrorResponse } from '@utils/errorResponse'
import { Contact, SiteContact, Site } from '@models/stormwater'

// Types
import { Request, Response, NextFunction } from 'express'
import { Model, ModelStatic } from 'sequelize'
import { ControllerResponse } from '@controllers/types'
import { ContactInterface } from '@models/stormwater/types'
import { CreateContactRequest, CreateContactResponse, GetContactsResponse, GetContactResponse, UpdateContactRequest, UpdateContactResponse } from './types'

// @desc    Create contact
// @route   POST /api/v1/stormwater/contacts
// @access  Private
export const createContact = asyncHandler(async (req: Request<{}, {}, CreateContactRequest>, res: Response<CreateContactResponse>, next: NextFunction) => {
  const { name, phone, company, email } = req.body

  const userEmail = req.user?.email

  const contact = await Contact.create({
    contactId: `contact-${ nanoid() }`,
    name,
    phone,
    company,
    email,
    createdBy: userEmail,
    updatedBy: userEmail,
  }) as Model<ContactInterface>

  if(!contact) {
    return next(new ErrorResponse("Could not create contact", 500))
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
    include: [{ model: SiteContact, include: [{ model: Site }] }]
  }) as Model<ContactInterface>[]

  if(!contacts.length) {
    return next(new ErrorResponse('Could not return contacts', 500))
  }

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
    return next(new ErrorResponse(`Could not return contact with uuid ${ req.params.uuid }`, 500))
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

  const userEmail = req.user?.email

  const contact = await Contact.update({
    name,
    phone,
    company,
    email,
    inactive,
    updatedBy: userEmail,
  },{
    where: {
      uuid: req.params.uuid
    },
    returning: true,
  })

  if(!contact) {
    return next(new ErrorResponse(`Could not update contact with uuid ${ req.params.uuid }`, 500))
  }

  const data = contact[1] as Model<ContactInterface>[] & ContactInterface

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
  await Contact.destroy({
    where: {
      uuid: req.params.uuid
    }
  })

  res.status(200).json({
    success: true,
    msg: "Contact Deleted"
  })
})
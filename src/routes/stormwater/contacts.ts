import express from 'express'
import { createContact, getContacts, getContact, updateContact, deleteContact } from '@controllers/stormwater/contacts'
import { protect } from '@middleware/auth'

const router = express.Router()

router.use(protect)

router
  .route('/')
  .get(getContacts)
  .post(createContact)

router
  .route('/:uuid')
  .get(getContact)
  .put(updateContact)
  .delete(deleteContact)

export default router
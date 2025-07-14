import { Router } from 'express'
import { createContact, getContacts, getContact, updateContact, deleteContact } from '@controllers/stormwater/contact'
import { entra } from '@middleware/auth'

const router = Router()

router.use(entra)

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
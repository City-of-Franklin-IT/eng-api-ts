import { Router } from 'express'
import { createContact, getContacts, getContact, updateContact, deleteContact } from '@controllers/stormwater/contact'
import { entra } from '@middleware/auth'
import { requireWrite } from '@utils/requireRole'

const router = Router()

router.use(entra)

router
  .route('/')
  .get(getContacts)
  .post(requireWrite("stormwater"), createContact)

router
  .route('/:uuid')
  .get(getContact)
  .put(requireWrite("stormwater"), updateContact)
  .delete(requireWrite("stormwater"), deleteContact)

export default router
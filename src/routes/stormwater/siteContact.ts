import { Router } from 'express'
import { createSiteContact, deleteSiteContact } from '@controllers/stormwater/siteContact'
import { entra } from '@middleware/auth'

const router = Router()

router.use(entra)

router
  .route('/')
  .post(createSiteContact)

router
  .route('/:uuid')
  .delete(deleteSiteContact)

export default router
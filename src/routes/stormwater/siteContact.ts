import { Router } from 'express'
import { createSiteContact, deleteSiteContacts } from '@controllers/stormwater/siteContact'
import { entra } from '@middleware/auth'

const router = Router()

router.use(entra)

router
  .route('/')
  .post(createSiteContact)

router
  .route('/site/:siteid')
  .delete(deleteSiteContacts)

export default router
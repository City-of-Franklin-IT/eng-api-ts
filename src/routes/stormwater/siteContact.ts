import { Router } from 'express'
import { createSiteContact, deleteSiteContacts } from '@controllers/stormwater/siteContact'
import { entra } from '@middleware/auth'
import { requireWrite } from '@utils/requireRole'

const router = Router()

router.use(entra, requireWrite("stormwater"))

router
  .route('/')
  .post(createSiteContact)

router
  .route('/site/:siteid')
  .delete(deleteSiteContacts)

export default router
import { Router } from 'express'
import { createSiteContact, deleteSiteContacts } from '@controllers/stormwater/siteContacts'
import { protect } from '@middleware/auth'

const router = Router()

router.use(protect)

router
  .route('/')
  .post(createSiteContact)

router
  .route('/:uuid')

router
  .route('/site/:siteid')
  .delete(deleteSiteContacts)

export default router
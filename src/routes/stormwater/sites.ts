import { Router } from 'express'
import { createSite, getSites, getSite, updateSite, deleteSite } from '@controllers/stormwater/sites'
import { protect } from '@middleware/auth'

const router = Router()

router.use(protect)

router
  .route('/')
  .get(getSites)
  .post(createSite)

router
  .route('/:uuid')
  .get(getSite)
  .put(updateSite)
  .delete(deleteSite)

export default router
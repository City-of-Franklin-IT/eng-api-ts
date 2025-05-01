import { Router } from 'express'
import { createSite, getSites, getSite, updateSite, deleteSite } from '@controllers/stormwater/site'
import { entra } from '@middleware/auth'

const router = Router()

router.use(entra)

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
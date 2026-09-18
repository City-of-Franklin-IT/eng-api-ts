import { Router } from 'express'
import { createSite, getSites, getSite, updateSite, deleteSite } from '@controllers/stormwater/site'
import { entra } from '@middleware/auth'
import { requireWrite } from '@utils/requireRole'

const router = Router()

router.use(entra)

router
  .route('/')
  .get(getSites)
  .post(requireWrite("stormwater"), createSite)

router
  .route('/:uuid')
  .get(getSite)
  .put(requireWrite("stormwater"), updateSite)
  .delete(requireWrite("stormwater"), deleteSite)

export default router
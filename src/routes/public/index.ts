import { Router } from 'express'
import { getProjects } from '@controllers/cip/public'
import { getActiveSites } from '@controllers/stormwater/site'

const router = Router()

router
  .route('/active-projects')
  .get(getProjects)

router
  .route('/active-sites')
  .get(getActiveSites)

export default router
import { Router } from 'express'
import { getProjects, getProject } from '@controllers/cip/public'
import { getActiveSites } from '@controllers/stormwater/site'

const router = Router()

router
  .route('/active-projects')
  .get(getProjects)

router
  .route('/active-projects/:uuid')
  .get(getProject)

router
  .route('/active-sites')
  .get(getActiveSites)

export default router
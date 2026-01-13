import { Router } from 'express'
import { getProjects, getProject } from '@controllers/cip/public'
import { getActiveSites, getActiveSite } from '@controllers/stormwater/site'

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

router
  .route('/active-sites/:uuid')
  .get(getActiveSite)

export default router
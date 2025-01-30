import { Router } from 'express'
import { getProjects } from '@controllers/cip/public'

const router = Router()

router
  .route('/active-projects')
  .get(getProjects)

export default router
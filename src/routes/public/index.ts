import express from 'express'
import { getProjects } from '@controllers/cip/public'

const router = express.Router()

router
  .route('/active-projects')
  .get(getProjects)

export default router
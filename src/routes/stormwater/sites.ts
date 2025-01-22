import express from 'express'
import { createSite, getSites, getSite, updateSite, deleteSite, getActiveSites } from '@controllers/stormwater/sites'
import { protect } from '@middleware/auth'

const router = express.Router()

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

router
  .route('/active/get')
  .get(getActiveSites)

export default router
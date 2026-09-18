import { Router } from 'express'
import { createFollowUpDate, updateFollowUpDate, deleteFollowUpDate } from '@controllers/stormwater/followUpDate'
import { entra } from '@middleware/auth'
import { requireWrite } from '@utils/requireRole'

const router = Router()

router.use(entra)

router
  .route('/')
  .post(requireWrite("stormwater"), createFollowUpDate)

router
  .route('/:uuid')
  .put(requireWrite("stormwater"), updateFollowUpDate)
  .delete(requireWrite("stormwater"), deleteFollowUpDate)

export default router
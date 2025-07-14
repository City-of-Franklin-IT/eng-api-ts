import { Router } from 'express'
import { createFollowUpDate, updateFollowUpDate, deleteFollowUpDate } from '@controllers/stormwater/followUpDate'
import { entra } from '@middleware/auth'

const router = Router()

router.use(entra)

router
  .route('/')
  .post(createFollowUpDate)

router
  .route('/:uuid')
  .put(updateFollowUpDate)
  .delete(deleteFollowUpDate)

export default router
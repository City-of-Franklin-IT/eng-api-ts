import { Router } from 'express'
import { createFollowUpDate, updateFollowUpDate, deleteFollowUpDate } from '@controllers/stormwater/followUpDates'
import { protect } from '@middleware/auth'

const router = Router()

router.use(protect)

router
  .route('/')
  .post(createFollowUpDate)

router
  .route('/:uuid')
  .put(updateFollowUpDate)
  .delete(deleteFollowUpDate)

export default router
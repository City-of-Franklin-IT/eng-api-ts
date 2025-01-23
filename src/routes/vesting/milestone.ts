import express from 'express'
import { createMilestone, updateMilestone, updateMilestoneStatus } from '@controllers/vesting/milestone'
import { protect } from '@middleware/auth'

const router = express.Router()

router.use(protect)

router
  .route('/')
  .post(createMilestone)

router
  .route('/:uuid')
  .put(updateMilestone)

router
  .route('/status/:uuid')
  .put(updateMilestoneStatus)

export default router
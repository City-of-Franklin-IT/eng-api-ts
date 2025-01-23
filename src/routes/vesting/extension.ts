import express from 'express'
import { createMilestoneExtension, updateMilestoneExtension, deleteMilestoneExtension } from '@controllers/vesting/milestoneExtension'
import { protect } from '@middleware/auth'

const router = express.Router()

router.use(protect)

router
  .route('/')
  .post(createMilestoneExtension)

router
  .route('/:uuid')
  .put(updateMilestoneExtension)
  .delete(deleteMilestoneExtension)

export default router
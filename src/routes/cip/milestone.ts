import express from 'express'
import { createMilestone, updateMilestone, deleteMilestone } from '@controllers/cip/milestone'
import { protect } from '@middleware/auth'

const router = express.Router()

router.use(protect)

router
  .route('/')
  .post(createMilestone)

router
  .route('/:uuid')
  .put(updateMilestone)
  .delete(deleteMilestone)

export default router
import { Router } from 'express'
import { createMilestoneExtension, updateMilestoneExtension, deleteMilestoneExtension } from '@controllers/vesting/milestoneExtension'
import { entra } from '@middleware/auth'

const router = Router()

router.use(entra)

router
  .route('/')
  .post(createMilestoneExtension)

router
  .route('/:uuid')
  .put(updateMilestoneExtension)
  .delete(deleteMilestoneExtension)

export default router
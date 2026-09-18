import { Router } from 'express'
import { createMilestoneExtension, updateMilestoneExtension, deleteMilestoneExtension } from '@controllers/vesting/milestoneExtension'
import { entra } from '@middleware/auth'
import { requireWrite } from '@utils/requireRole'

const router = Router()

router.use(entra, requireWrite("vesting"))

router
  .route('/')
  .post(createMilestoneExtension)

router
  .route('/:uuid')
  .put(updateMilestoneExtension)
  .delete(deleteMilestoneExtension)

export default router
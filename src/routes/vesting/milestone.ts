import { Router } from 'express'
import { createMilestone, updateMilestone, updateMilestoneStatus } from '@controllers/vesting/milestone'
import { entra } from '@middleware/auth'
import { requireWrite } from '@utils/requireRole'

const router = Router()

router.use(entra, requireWrite("vesting"))

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
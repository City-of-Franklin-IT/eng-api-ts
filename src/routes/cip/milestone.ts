import { Router } from 'express'
import { createMilestone, updateMilestone, deleteMilestone } from '@controllers/cip/milestone'
import { entra } from '@middleware/auth'
import { requireWrite } from '@utils/requireRole'

const router = Router()

router.use(entra, requireWrite("cip"))

router
  .route('/')
  .post(createMilestone)

router
  .route('/:uuid')
  .put(updateMilestone)
  .delete(deleteMilestone)

export default router
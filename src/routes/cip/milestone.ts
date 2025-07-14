import { Router } from 'express'
import { createMilestone, updateMilestone, deleteMilestone } from '@controllers/cip/milestone'
import { entra } from '@middleware/auth'

const router = Router()

router.use(entra)

router
  .route('/')
  .post(createMilestone)

router
  .route('/:uuid')
  .put(updateMilestone)
  .delete(deleteMilestone)

export default router
import { Router } from 'express'
import { createApproval, updateApproval } from '@controllers/vesting/approval'
import { entra } from '@middleware/auth'
import { requireWrite } from '@utils/requireRole'

const router = Router()

router.use(entra, requireWrite("vesting"))

router
  .route('/')
  .post(createApproval)

  router
  .route('/:uuid')
  .put(updateApproval)

export default router
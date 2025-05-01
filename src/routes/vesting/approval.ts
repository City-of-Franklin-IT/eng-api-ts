import { Router } from 'express'
import { createApproval, updateApproval, deleteApproval } from '@controllers/vesting/approval'
import { entra } from '@middleware/auth'

const router = Router()

router.use(entra)

router
  .route('/')
  .post(createApproval)

  router
  .route('/:uuid')
  .put(updateApproval)
  .delete(deleteApproval)

export default router
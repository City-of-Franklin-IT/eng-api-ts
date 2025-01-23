import express from 'express'
import { createApproval, updateApproval, deleteApproval } from '@controllers/vesting/approval'
import { protect } from '@middleware/auth'

const router = express.Router()

router.use(protect)

router
  .route('/')
  .post(createApproval)

  router
  .route('/:uuid')
  .put(updateApproval)
  .delete(deleteApproval)

export default router
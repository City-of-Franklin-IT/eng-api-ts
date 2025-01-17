import express from 'express'
import { createSpending, deleteSpending } from '@controllers/cip/spending'
import { protect } from '@middleware/auth'

const router = express.Router()

router.use(protect)

router
  .route('/')
  .post(createSpending)

router
  .route('/:uuid')
  .delete(deleteSpending)

export default router
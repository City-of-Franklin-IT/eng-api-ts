import express from 'express'
import { createPhase, deletePhase } from '@controllers/cip/phase'
import { protect } from '@middleware/auth'

const router = express.Router()

router.use(protect)

router
  .route('/')
  .post(createPhase)

router
  .route('/:uuid')
  .delete(deletePhase)

export default router
import express from 'express'
import { createResolution, updateResolution } from '@controllers/vesting/resolution'
import { protect } from '@middleware/auth'

const router = express.Router()

router.use(protect)

router
  .route('/')
  .post(createResolution)

router
  .route('/:uuid')
  .put(updateResolution)

export default router
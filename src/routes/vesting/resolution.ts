import { Router } from 'express'
import { createResolution, updateResolution } from '@controllers/vesting/resolution'
import { entra } from '@middleware/auth'

const router = Router()

router.use(entra)

router
  .route('/')
  .post(createResolution)

router
  .route('/:uuid')
  .put(updateResolution)

export default router
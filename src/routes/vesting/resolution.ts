import { Router } from 'express'
import { createResolution, updateResolution } from '@controllers/vesting/resolution'
import { entra } from '@middleware/auth'
import { requireWrite } from '@utils/requireRole'

const router = Router()

router.use(entra, requireWrite("vesting"))

router
  .route('/')
  .post(createResolution)

router
  .route('/:uuid')
  .put(updateResolution)

export default router
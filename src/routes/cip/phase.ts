import { Router } from 'express'
import { createPhase, updatePhase, deletePhase } from '@controllers/cip/phase'
import { entra } from '@middleware/auth'

const router = Router()

router.use(entra)

router
  .route('/')
  .post(createPhase)

router
  .route('/:uuid')
  .put(updatePhase)
  .delete(deletePhase)

export default router
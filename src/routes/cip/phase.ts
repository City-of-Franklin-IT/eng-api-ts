import { Router } from 'express'
import { createPhase, updatePhase, deletePhase } from '@controllers/cip/phase'
import { entra } from '@middleware/auth'
import { requireWrite } from '@utils/requireRole'

const router = Router()

router.use(entra, requireWrite("cip"))

router
  .route('/')
  .post(createPhase)

router
  .route('/:uuid')
  .put(updatePhase)
  .delete(deletePhase)

export default router
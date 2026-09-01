import { Router } from 'express'
import { createLog, getLog, updateLog, deleteLog } from '@controllers/stormwater/log'
import { entra } from '@middleware/auth'
import { requireWrite } from '@utils/requireRole'

const router = Router()

router.use(entra)

router
  .route('/')
  .post(requireWrite("stormwater"), createLog)

router
  .route('/:uuid')
  .get(getLog)
  .put(requireWrite("stormwater"), updateLog)
  .delete(requireWrite("stormwater"), deleteLog)

export default router
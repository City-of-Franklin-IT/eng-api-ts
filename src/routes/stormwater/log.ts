import { Router } from 'express'
import { createLog, getLog, updateLog, deleteLog } from '@controllers/stormwater/log'
import { entra } from '@middleware/auth'

const router = Router()

router.use(entra)

router
  .route('/')
  .post(createLog)

router
  .route('/:uuid')
  .get(getLog)
  .put(updateLog)
  .delete(deleteLog)

export default router
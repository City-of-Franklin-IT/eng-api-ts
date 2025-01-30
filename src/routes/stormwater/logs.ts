import { Router } from 'express'
import { createLog, getLog, updateLog, deleteLog } from '@controllers/stormwater/logs'
import { protect } from '@middleware/auth'

const router = Router()

router.use(protect)

router
  .route('/')
  .post(createLog)

router
  .route('/:uuid')
  .get(getLog)
  .put(updateLog)
  .delete(deleteLog)

export default router
import { Router } from 'express'
import { createUpdate, updateUpdate, deleteUpdate } from '@controllers/cip/update'
import { protect } from '@middleware/auth'

const router = Router()

router.use(protect)

router
  .route('/')
  .post(createUpdate)

router
  .route('/:uuid')
  .put(updateUpdate)
  .delete(deleteUpdate)

export default router
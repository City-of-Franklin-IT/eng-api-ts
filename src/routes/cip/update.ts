import { Router } from 'express'
import { createUpdate, updateUpdate, deleteUpdate } from '@controllers/cip/update'
import { entra } from '@middleware/auth'
import { requireWrite } from '@utils/requireRole'

const router = Router()

router.use(entra, requireWrite("cip"))

router
  .route('/')
  .post(createUpdate)

router
  .route('/:uuid')
  .put(updateUpdate)
  .delete(deleteUpdate)

export default router
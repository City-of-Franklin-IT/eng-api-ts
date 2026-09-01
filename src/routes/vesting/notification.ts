import { Router } from 'express'
import { createNotification, updateNotification, deleteNotification } from '@controllers/vesting/vestingNotification'
import { entra } from '@middleware/auth'
import { requireWrite } from '@utils/requireRole'

const router = Router()

router.use(entra, requireWrite("vesting"))

router
  .route('/')
  .post(createNotification)

router
  .route('/:uuid')
  .put(updateNotification)
  .delete(deleteNotification)

export default router
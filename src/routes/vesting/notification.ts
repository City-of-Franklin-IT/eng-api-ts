import { Router } from 'express'
import { createNotification, updateNotification, deleteNotification } from '@controllers/vesting/vestingNotification'
import { entra } from '@middleware/auth'

const router = Router()

router.use(entra)

router
  .route('/')
  .post(createNotification)

router
  .route('/:uuid')
  .put(updateNotification)
  .delete(deleteNotification)

export default router
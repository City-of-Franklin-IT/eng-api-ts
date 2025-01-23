import express from 'express'
import { createNotification, updateNotification, deleteNotification } from '@controllers/vesting/vestingNotification'
import { protect } from '@middleware/auth'

const router = express.Router()

router.use(protect)

router
  .route('/')
  .post(createNotification)

router
  .route('/:uuid')
  .put(updateNotification)
  .delete(deleteNotification)

export default router
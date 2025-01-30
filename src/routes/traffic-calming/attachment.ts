import { Router } from 'express'
import multer from 'multer'
import { createAttachment, getAttachment, deleteAttachment } from '@controllers/traffic-calming/attachment'
import { protect } from '@middleware/auth'

const router = Router()

router.use(protect)

router
  .route('/')
  .post(protect, multer().single('file'), createAttachment)

router
  .route('/:uuid')
  .get(getAttachment)
  .delete(protect, deleteAttachment)

export default router
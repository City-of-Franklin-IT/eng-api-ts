import { Router } from 'express'
import multer from 'multer'
import { createAttachment, getAttachment, deleteAttachment } from '@controllers/traffic-calming/attachment'
import { entra } from '@middleware/auth'

const router = Router()

router.use(entra)

router
  .route('/')
  .post(entra, multer().single('file'), createAttachment)

router
  .route('/:uuid')
  .get(getAttachment)
  .delete(entra, deleteAttachment)

export default router
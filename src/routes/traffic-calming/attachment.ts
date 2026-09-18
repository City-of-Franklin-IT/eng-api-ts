import { Router } from 'express'
import multer from 'multer'
import { createAttachment, getAttachment, deleteAttachment } from '@controllers/traffic-calming/attachment'
import { entra } from '@middleware/auth'
import { requireWrite } from '@utils/requireRole'

const router = Router()

router
  .route('/')
  .post(entra, requireWrite("traffic-calming"), multer().single('file'), createAttachment)

router
  .route('/:uuid')
  .get(getAttachment)
  .delete(entra, requireWrite("traffic-calming"), deleteAttachment)

export default router
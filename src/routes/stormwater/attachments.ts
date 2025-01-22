import express from 'express'
import multer from 'multer'
import { createAttachment, getAttachment, deleteAttachment } from '@controllers/stormwater/attachments'
import { protect } from '@middleware/auth'

const router = express.Router()

router.use(protect)

router
  .route('/')
  .post(multer().array("files"), createAttachment)

router
  .route('/:uuid')
  .get(getAttachment)
  .delete(deleteAttachment)

export default router
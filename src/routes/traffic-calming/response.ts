import express from 'express'
import { createResponse } from '@controllers/traffic-calming/response'

const router = express.Router()

router
  .route('/')
  .post(createResponse)

export default router
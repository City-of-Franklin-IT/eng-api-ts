import { Router } from 'express'
import { createResponse } from '@controllers/traffic-calming/response'

const router = Router()

router
  .route('/')
  .post(createResponse)

export default router
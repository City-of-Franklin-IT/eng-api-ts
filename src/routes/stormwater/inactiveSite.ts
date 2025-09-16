import { Router } from 'express'
import { createInactiveSite, deleteInactiveSite } from '@controllers/stormwater/inactiveSite'
import { entra } from '@middleware/auth'

const router = Router()

router.use(entra)

router
  .route('/')
  .post(createInactiveSite)

router
  .route('/:uuid')
  .delete(deleteInactiveSite)

export default router